import prisma from "../prisma/client.js";
import { apagarArquivoUpload, caminhoUpload } from "../utils/uploadImagem.js";
import { enviarPush } from "../utils/push.js";

/**
 * Fluxo da finalização de uma troca:
 *  1. Os dois enviam uma foto do serviço.
 *  2. Quem enviou a ÚLTIMA foto confirma (ou cancela) primeiro.
 *  3. Depois o outro confirma. Com as duas confirmações a troca é finalizada
 *     e o anúncio passa para "trocado".
 *  Cancelar apaga as fotos e as confirmações: os dois precisam refazer o processo.
 *
 * usuarioA = dono do anúncio | usuarioB = quem fez a proposta aceita.
 */

// Descobre a troca a partir dos dois usuários (não importa quem é quem na requisição)
async function acharTroca(anuncioId, usuarioId, outroUsuarioId) {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { id: true, titulo: true, usuarioId: true },
  });
  if (!anuncio) return { erro: "Anúncio não encontrado.", status: 404 };

  let usuarioBId;
  if (anuncio.usuarioId === usuarioId) usuarioBId = outroUsuarioId;
  else if (anuncio.usuarioId === outroUsuarioId) usuarioBId = usuarioId;
  else return { erro: "Os usuários informados não participam desta troca.", status: 400 };

  const troca = await prisma.troca.findUnique({
    where: { anuncioId_usuarioBId: { anuncioId, usuarioBId } },
  });
  if (!troca) return { erro: "Troca não encontrada.", status: 404 };

  return { anuncio, troca };
}

// Visão da troca do ponto de vista de quem está olhando (usuarioId)
function visao(troca, usuarioId) {
  const souA = troca.usuarioAId === usuarioId;

  const minhaFoto = souA ? troca.usuarioAFoto : troca.usuarioBFoto;
  const fotoDoOutro = souA ? troca.usuarioBFoto : troca.usuarioAFoto;
  const minhaConfirmou = souA ? troca.usuarioAConfirmou : troca.usuarioBConfirmou;
  const outroConfirmou = souA ? troca.usuarioBConfirmou : troca.usuarioAConfirmou;
  const euSouUltimo = troca.ultimoEnviouId === usuarioId;
  const ambasFotos = Boolean(minhaFoto && fotoDoOutro);

  // é a minha vez se as fotos estão enviadas, eu ainda não confirmei,
  // e (fui o último a enviar a foto OU o outro já confirmou)
  const minhaVez =
    !troca.finalizada && ambasFotos && !minhaConfirmou && (euSouUltimo || outroConfirmou);

  return {
    finalizada: troca.finalizada,
    minhaFoto,
    fotoDoOutro,
    minhaConfirmou,
    outroConfirmou,
    euSouUltimo,
    minhaVez,
  };
}

function lerIds(corpo) {
  return {
    anuncioId: Number(corpo?.anuncioId),
    usuarioId: Number(corpo?.usuarioId),
    outroUsuarioId: Number(corpo?.outroUsuarioId),
  };
}

async function nomeDoUsuario(id) {
  const u = await prisma.usuario.findUnique({ where: { id }, select: { nome: true } });
  return u?.nome ?? "O outro usuário";
}

class TrocaController {
  // GET /troca/:anuncioId/:usuarioId/:outroUsuarioId
  async Status(req, res) {
    try {
      const anuncioId = Number(req.params.anuncioId);
      const usuarioId = Number(req.params.usuarioId);
      const outroUsuarioId = Number(req.params.outroUsuarioId);

      if (!anuncioId || !usuarioId || !outroUsuarioId) {
        return res.status(400).json({ erro: "anuncioId, usuarioId e outroUsuarioId são obrigatórios." });
      }

      const achado = await acharTroca(anuncioId, usuarioId, outroUsuarioId);
      if (achado.erro) return res.status(achado.status).json({ erro: achado.erro });

      return res.status(200).json(visao(achado.troca, usuarioId));
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar a troca" });
    }
  }

  // POST /troca/enviar-foto (multipart: foto, anuncioId, usuarioId, outroUsuarioId)
  async EnviarFoto(req, res) {
    const descartarArquivo = () => req.file && apagarArquivoUpload(req.file.path);

    try {
      const { anuncioId, usuarioId, outroUsuarioId } = lerIds(req.body);

      if (!req.file || !anuncioId || !usuarioId || !outroUsuarioId) {
        descartarArquivo();
        return res.status(400).json({ erro: "foto, anuncioId, usuarioId e outroUsuarioId são obrigatórios." });
      }

      const achado = await acharTroca(anuncioId, usuarioId, outroUsuarioId);
      if (achado.erro) {
        descartarArquivo();
        return res.status(achado.status).json({ erro: achado.erro });
      }

      const { troca, anuncio } = achado;
      const souA = troca.usuarioAId === usuarioId;

      if (troca.finalizada) {
        descartarArquivo();
        return res.status(400).json({ erro: "Essa troca já foi finalizada." });
      }

      if (souA ? troca.usuarioAFoto : troca.usuarioBFoto) {
        descartarArquivo();
        return res.status(409).json({ erro: "Você já enviou a sua foto." });
      }

      const caminho = caminhoUpload("troca", req.file.filename);

      const atualizada = await prisma.troca.update({
        where: { id: troca.id },
        data: {
          ...(souA ? { usuarioAFoto: caminho } : { usuarioBFoto: caminho }),
          ultimoEnviouId: usuarioId,
        },
      });

      const nome = await nomeDoUsuario(usuarioId);
      const completo = Boolean(atualizada.usuarioAFoto && atualizada.usuarioBFoto);

      void enviarPush(outroUsuarioId, {
        titulo: completo ? "Fotos enviadas!" : "Foto do serviço enviada",
        corpo: completo
          ? `${nome} enviou a foto de "${anuncio.titulo}". Abra para confirmar a troca.`
          : `${nome} enviou a foto de "${anuncio.titulo}". Falta a sua.`,
        dados: { tipo: "troca", anuncioId, outroUsuarioId: usuarioId },
      });

      return res.status(200).json({ mensagem: "Foto enviada com sucesso.", ...visao(atualizada, usuarioId) });
    } catch (erro) {
      console.error(erro);
      descartarArquivo();
      return res.status(500).json({ erro: "Erro ao enviar a foto do serviço" });
    }
  }

  // POST /troca/confirmar { anuncioId, usuarioId, outroUsuarioId }
  async Confirmar(req, res) {
    try {
      const { anuncioId, usuarioId, outroUsuarioId } = lerIds(req.body);
      if (!anuncioId || !usuarioId || !outroUsuarioId) {
        return res.status(400).json({ erro: "anuncioId, usuarioId e outroUsuarioId são obrigatórios." });
      }

      const achado = await acharTroca(anuncioId, usuarioId, outroUsuarioId);
      if (achado.erro) return res.status(achado.status).json({ erro: achado.erro });

      const { troca, anuncio } = achado;

      if (troca.finalizada) return res.status(200).json({ finalizada: true });

      const v = visao(troca, usuarioId);
      if (!v.minhaFoto || !v.fotoDoOutro) {
        return res.status(400).json({ erro: "Os dois precisam enviar a foto do serviço antes de confirmar." });
      }
      if (v.minhaConfirmou) {
        return res.status(409).json({ erro: "Você já confirmou. Aguarde o outro usuário." });
      }
      if (!v.minhaVez) {
        return res.status(400).json({ erro: "Ainda não é a sua vez de confirmar." });
      }

      const souA = troca.usuarioAId === usuarioId;
      const nome = await nomeDoUsuario(usuarioId);

      // se o outro já tinha confirmado, a troca termina agora
      if (v.outroConfirmou) {
        await prisma.$transaction([
          prisma.troca.update({
            where: { id: troca.id },
            data: {
              ...(souA ? { usuarioAConfirmou: true } : { usuarioBConfirmou: true }),
              finalizada: true,
            },
          }),
          prisma.anuncio.update({ where: { id: anuncioId }, data: { status: "trocado" } }),
        ]);

        void enviarPush(outroUsuarioId, {
          titulo: "Troca finalizada!",
          corpo: `A troca de "${anuncio.titulo}" foi concluída. Que tal avaliar ${nome}?`,
          dados: { tipo: "troca", anuncioId, outroUsuarioId: usuarioId },
        });

        return res.status(200).json({ mensagem: "Troca finalizada!", finalizada: true });
      }

      await prisma.troca.update({
        where: { id: troca.id },
        data: souA ? { usuarioAConfirmou: true } : { usuarioBConfirmou: true },
      });

      void enviarPush(outroUsuarioId, {
        titulo: "Troca confirmada",
        corpo: `${nome} confirmou a troca de "${anuncio.titulo}". Agora é a sua vez de confirmar ou cancelar.`,
        dados: { tipo: "troca", anuncioId, outroUsuarioId: usuarioId },
      });

      return res.status(200).json({ mensagem: "Confirmação registrada.", finalizada: false });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao confirmar a troca" });
    }
  }

  // POST /troca/cancelar { anuncioId, usuarioId, outroUsuarioId }
  async Cancelar(req, res) {
    try {
      const { anuncioId, usuarioId, outroUsuarioId } = lerIds(req.body);
      if (!anuncioId || !usuarioId || !outroUsuarioId) {
        return res.status(400).json({ erro: "anuncioId, usuarioId e outroUsuarioId são obrigatórios." });
      }

      const achado = await acharTroca(anuncioId, usuarioId, outroUsuarioId);
      if (achado.erro) return res.status(achado.status).json({ erro: achado.erro });

      const { troca, anuncio } = achado;

      if (troca.finalizada) {
        return res.status(400).json({ erro: "Essa troca já foi finalizada e não pode ser cancelada." });
      }

      // zera tudo: fotos, confirmações e quem enviou por último
      await prisma.troca.update({
        where: { id: troca.id },
        data: {
          usuarioAFoto: null,
          usuarioBFoto: null,
          usuarioAConfirmou: false,
          usuarioBConfirmou: false,
          ultimoEnviouId: null,
        },
      });

      apagarArquivoUpload(troca.usuarioAFoto);
      apagarArquivoUpload(troca.usuarioBFoto);

      const nome = await nomeDoUsuario(usuarioId);
      void enviarPush(outroUsuarioId, {
        titulo: "Finalização cancelada",
        corpo: `${nome} cancelou a finalização de "${anuncio.titulo}". Enviem as fotos novamente.`,
        dados: { tipo: "troca", anuncioId, outroUsuarioId: usuarioId },
      });

      return res.status(200).json({ mensagem: "Finalização cancelada. As fotos foram apagadas." });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao cancelar a troca" });
    }
  }

  // GET /troca/pendentes/:usuarioId -> lista da aba "Trocas" das notificações
  async Pendentes(req, res) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      if (!usuarioId) return res.status(400).json({ erro: "usuarioId é obrigatório." });

      const trocas = await prisma.troca.findMany({
        where: { OR: [{ usuarioAId: usuarioId }, { usuarioBId: usuarioId }] },
        include: {
          anuncio: { select: { id: true, titulo: true } },
          // trocas finalizadas só continuam na lista enquanto eu não avaliei
          avaliacao: { where: { avaliadorId: usuarioId }, select: { id: true } },
        },
        orderBy: { atualizadoEm: "desc" },
      });

      const visiveis = trocas.filter((t) => !t.finalizada || t.avaliacao.length === 0);

      const idsOutros = [
        ...new Set(visiveis.map((t) => (t.usuarioAId === usuarioId ? t.usuarioBId : t.usuarioAId))),
      ];
      const outros = await prisma.usuario.findMany({
        where: { id: { in: idsOutros } },
        select: { id: true, nome: true, foto: true },
      });
      const mapaOutros = new Map(outros.map((u) => [u.id, u]));

      const resposta = visiveis.map((t) => {
        const outroId = t.usuarioAId === usuarioId ? t.usuarioBId : t.usuarioAId;
        const outro = mapaOutros.get(outroId);
        const v = visao(t, usuarioId);

        return {
          anuncioId: t.anuncioId,
          anuncioTitulo: t.anuncio.titulo,
          outroUsuarioId: outroId,
          outroUsuarioNome: outro?.nome ?? "Usuário",
          outroUsuarioFoto: outro?.foto ?? null,
          minhaFotoEnviada: Boolean(v.minhaFoto),
          fotoDoOutroEnviada: Boolean(v.fotoDoOutro),
          minhaConfirmou: v.minhaConfirmou,
          outroConfirmou: v.outroConfirmou,
          euSouUltimo: v.euSouUltimo,
          minhaVez: v.minhaVez,
          finalizada: v.finalizada,
          atualizadoEm: t.atualizadoEm,
        };
      });

      return res.status(200).json({ trocas: resposta });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar as trocas" });
    }
  }
}

export default new TrocaController();
