import prisma from "../prisma/client.js";
import { enviarPush } from "../utils/push.js";

const USUARIO_PUBLICO = { select: { id: true, nome: true, foto: true } };

class PropostaController {
  // POST /propostas  { anuncioId, propostoPor, mensagem }
  async Criar(req, res) {
    try {
      const anuncioId = Number(req.body?.anuncioId);
      const propostoPor = Number(req.body?.propostoPor);
      const mensagem = typeof req.body?.mensagem === "string" ? req.body.mensagem.trim() : "";

      if (!anuncioId || !propostoPor || !mensagem) {
        return res.status(400).json({ erro: "anuncioId, propostoPor e mensagem são obrigatórios." });
      }

      const [anuncio, proponente] = await Promise.all([
        prisma.anuncio.findUnique({ where: { id: anuncioId } }),
        prisma.usuario.findUnique({ where: { id: propostoPor }, select: { id: true, nome: true } }),
      ]);

      if (!anuncio) return res.status(404).json({ erro: "Anúncio não encontrado." });
      if (!proponente) return res.status(404).json({ erro: "Usuário não encontrado." });

      if (anuncio.usuarioId === propostoPor) {
        return res.status(400).json({ erro: "Você não pode enviar proposta no seu próprio anúncio." });
      }

      if (anuncio.status !== "ativo") {
        return res.status(400).json({ erro: "Esse anúncio não está mais disponível para propostas." });
      }

      const jaExiste = await prisma.proposta.findFirst({
        where: { anuncioId, propostoPor, status: "pendente" },
      });
      if (jaExiste) {
        return res.status(409).json({ erro: "Você já enviou uma proposta pendente para esse anúncio." });
      }

      const proposta = await prisma.proposta.create({
        data: { anuncioId, propostoPor, mensagem },
      });

      void enviarPush(anuncio.usuarioId, {
        titulo: "Nova proposta recebida",
        corpo: `${proponente.nome} enviou uma proposta para "${anuncio.titulo}".`,
        dados: { tipo: "proposta", anuncioId },
      });

      return res.status(201).json({ proposta });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao enviar proposta" });
    }
  }

  // GET /propostas/recebidas?usuarioId=1  -> propostas feitas nos MEUS anúncios
  async Recebidas(req, res) {
    try {
      const usuarioId = Number(req.query.usuarioId);
      if (!usuarioId) return res.status(400).json({ erro: "usuarioId é obrigatório." });

      const propostas = await prisma.proposta.findMany({
        where: { anuncio: { usuarioId } },
        include: {
          anuncio: { select: { id: true, titulo: true } },
          usuario: USUARIO_PUBLICO,
        },
        orderBy: { criadoEm: "desc" },
      });

      return res.status(200).json({ propostas });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar propostas recebidas" });
    }
  }

  // GET /propostas/enviadas?usuarioId=1  -> propostas que EU fiz
  async Enviadas(req, res) {
    try {
      const usuarioId = Number(req.query.usuarioId);
      if (!usuarioId) return res.status(400).json({ erro: "usuarioId é obrigatório." });

      const propostas = await prisma.proposta.findMany({
        where: { propostoPor: usuarioId },
        include: {
          anuncio: {
            select: { id: true, titulo: true, usuario: USUARIO_PUBLICO },
          },
        },
        orderBy: { criadoEm: "desc" },
      });

      return res.status(200).json({ propostas });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar propostas enviadas" });
    }
  }

  // PUT /propostas/:id/responder  { status: "aceita" | "recusada" }
  async Responder(req, res) {
    try {
      const id = Number(req.params.id);
      const status = req.body?.status;

      if (!id) return res.status(400).json({ erro: "ID da proposta inválido." });
      if (status !== "aceita" && status !== "recusada") {
        return res.status(400).json({ erro: 'O status deve ser "aceita" ou "recusada".' });
      }

      const proposta = await prisma.proposta.findUnique({
        where: { id },
        include: { anuncio: true },
      });

      if (!proposta) return res.status(404).json({ erro: "Proposta não encontrada." });
      if (proposta.status !== "pendente") {
        return res.status(409).json({ erro: "Essa proposta já foi respondida." });
      }

      const { anuncio } = proposta;

      if (status === "aceita") {
        if (anuncio.status !== "ativo") {
          return res.status(409).json({ erro: "Esse anúncio já tem uma troca em andamento." });
        }

        // aceita a proposta, cria a troca e tira o anúncio da lista de disponíveis
        await prisma.$transaction([
          prisma.proposta.update({ where: { id }, data: { status: "aceita" } }),
          prisma.troca.upsert({
            where: {
              anuncioId_usuarioBId: { anuncioId: anuncio.id, usuarioBId: proposta.propostoPor },
            },
            update: {},
            create: {
              anuncioId: anuncio.id,
              usuarioAId: anuncio.usuarioId,
              usuarioBId: proposta.propostoPor,
            },
          }),
          prisma.anuncio.update({ where: { id: anuncio.id }, data: { status: "em_andamento" } }),
        ]);

        void enviarPush(proposta.propostoPor, {
          titulo: "Proposta aceita!",
          corpo: `Sua proposta para "${anuncio.titulo}" foi aceita. Combinem os detalhes pelo chat.`,
          dados: { tipo: "troca", anuncioId: anuncio.id, outroUsuarioId: anuncio.usuarioId },
        });
      } else {
        await prisma.proposta.update({ where: { id }, data: { status: "recusada" } });

        void enviarPush(proposta.propostoPor, {
          titulo: "Proposta recusada",
          corpo: `Sua proposta para "${anuncio.titulo}" foi recusada.`,
          dados: { tipo: "proposta", anuncioId: anuncio.id },
        });
      }

      return res.status(200).json({ mensagem: `Proposta ${status} com sucesso.`, status });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao responder proposta" });
    }
  }
}

export default new PropostaController();
