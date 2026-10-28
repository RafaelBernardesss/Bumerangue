import prisma from "../prisma/client.js";
import { apagarArquivoUpload, caminhoUpload } from "../utils/uploadImagem.js";

const USUARIO_PUBLICO = { select: { id: true, nome: true, foto: true } };

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

class AnuncioController {
  async Listar(req, res) {
    try {
      const { status, usuarioId, categoriaId } = req.query;
      const where = {};

      if (status) where.status = String(status);
      if (usuarioId) where.usuarioId = Number(usuarioId);
      if (categoriaId) where.categoriaId = Number(categoriaId);

      const anuncios = await prisma.anuncio.findMany({
        where,
        include: { usuario: USUARIO_PUBLICO, categoria: true },
        orderBy: { criadoEm: "desc" },
      });

      return res.status(200).json({ anuncios });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao listar anúncios" });
    }
  }

  async Detalhar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ erro: "ID do anúncio inválido." });

      const anuncio = await prisma.anuncio.findUnique({
        where: { id },
        include: { usuario: USUARIO_PUBLICO, categoria: true },
      });

      if (!anuncio) return res.status(404).json({ erro: "Anúncio não encontrado." });

      return res.status(200).json({ anuncio });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar anúncio" });
    }
  }

  async Criar(req, res) {
    try {
      const titulo = texto(req.body?.titulo);
      const descricao = texto(req.body?.descricao);
      const preferencia = texto(req.body?.preferencia);
      const disponibilidade = texto(req.body?.disponibilidade);
      const categoriaId = Number(req.body?.categoriaId);
      const usuarioId = Number(req.body?.usuarioId);

      if (!titulo || !descricao || !preferencia || !categoriaId || !usuarioId) {
        if (req.file) apagarArquivoUpload(req.file.path);
        return res.status(400).json({
          erro: "Título, descrição, preferência, categoria e usuário são obrigatórios.",
        });
      }

      const [usuario, categoria] = await Promise.all([
        prisma.usuario.findUnique({ where: { id: usuarioId }, select: { cidade: true, estado: true } }),
        prisma.categoria.findUnique({ where: { id: categoriaId } }),
      ]);

      if (!usuario || !categoria) {
        if (req.file) apagarArquivoUpload(req.file.path);
        return res.status(404).json({ erro: !usuario ? "Usuário não encontrado." : "Categoria não encontrada." });
      }

      const anuncio = await prisma.anuncio.create({
        data: {
          titulo,
          descricao,
          preferencia,
          disponibilidade: disponibilidade || null,
          foto: req.file ? caminhoUpload("anuncios", req.file.filename) : null,
          cidade: usuario.cidade,
          estado: usuario.estado,
          usuarioId,
          categoriaId,
        },
        include: { usuario: USUARIO_PUBLICO, categoria: true },
      });

      return res.status(201).json({ anuncio });
    } catch (erro) {
      console.error(erro);
      if (req.file) apagarArquivoUpload(req.file.path);
      return res.status(500).json({ erro: "Erro ao criar anúncio" });
    }
  }

  async Atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ erro: "ID do anúncio inválido." });

      const atual = await prisma.anuncio.findUnique({ where: { id } });
      if (!atual) {
        if (req.file) apagarArquivoUpload(req.file.path);
        return res.status(404).json({ erro: "Anúncio não encontrado." });
      }

      if (atual.status === "em_andamento" || atual.status === "trocado") {
        if (req.file) apagarArquivoUpload(req.file.path);
        return res.status(400).json({
          erro: "Esse anúncio já tem uma troca em andamento ou concluída e não pode ser editado.",
        });
      }

      const dados = {};
      const titulo = texto(req.body?.titulo);
      const descricao = texto(req.body?.descricao);
      const preferencia = texto(req.body?.preferencia);

      if (titulo) dados.titulo = titulo;
      if (descricao) dados.descricao = descricao;
      if (preferencia) dados.preferencia = preferencia;
      if (req.body?.disponibilidade !== undefined) {
        dados.disponibilidade = texto(req.body.disponibilidade) || null;
      }

      if (req.body?.categoriaId) {
        const categoria = await prisma.categoria.findUnique({ where: { id: Number(req.body.categoriaId) } });
        if (!categoria) {
          if (req.file) apagarArquivoUpload(req.file.path);
          return res.status(404).json({ erro: "Categoria não encontrada." });
        }
        dados.categoriaId = categoria.id;
      }

      if (req.file) dados.foto = caminhoUpload("anuncios", req.file.filename);

      const anuncio = await prisma.anuncio.update({
        where: { id },
        data: dados,
        include: { usuario: USUARIO_PUBLICO, categoria: true },
      });

      if (req.file && atual.foto) apagarArquivoUpload(atual.foto);

      return res.status(200).json({ anuncio });
    } catch (erro) {
      console.error(erro);
      if (req.file) apagarArquivoUpload(req.file.path);
      return res.status(500).json({ erro: "Erro ao atualizar anúncio" });
    }
  }

  async Excluir(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ erro: "ID do anúncio inválido." });

      const anuncio = await prisma.anuncio.findUnique({ where: { id } });
      if (!anuncio) return res.status(404).json({ erro: "Anúncio não encontrado." });

      if (anuncio.status === "em_andamento") {
        return res.status(400).json({
          erro: "Esse anúncio tem uma troca em andamento. Finalize ou cancele a troca antes de excluir.",
        });
      }

      if (anuncio.status === "trocado") {
        return res.status(400).json({
          erro: "Esse serviço já foi realizado e fica guardado no seu histórico.",
        });
      }

      const trocas = await prisma.troca.findMany({
        where: { anuncioId: id },
        select: { usuarioAFoto: true, usuarioBFoto: true },
      });

      await prisma.anuncio.delete({ where: { id } });

      apagarArquivoUpload(anuncio.foto);
      for (const t of trocas) {
        apagarArquivoUpload(t.usuarioAFoto);
        apagarArquivoUpload(t.usuarioBFoto);
      }

      return res.status(200).json({ mensagem: "Anúncio excluído com sucesso." });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao excluir anúncio" });
    }
  }

  async ServicosRealizados(req, res) {
    try {
      const usuarioId = Number(req.query.usuarioId);
      if (!usuarioId) return res.status(400).json({ erro: "usuarioId é obrigatório." });

      const trocas = await prisma.troca.findMany({
        where: {
          finalizada: true,
          OR: [{ usuarioAId: usuarioId }, { usuarioBId: usuarioId }],
        },
        include: { anuncio: { include: { categoria: true } } },
        orderBy: { atualizadoEm: "desc" },
      });

      const idsParceiros = [
        ...new Set(trocas.map((t) => (t.usuarioAId === usuarioId ? t.usuarioBId : t.usuarioAId))),
      ];
      const parceiros = await prisma.usuario.findMany({
        where: { id: { in: idsParceiros } },
        select: { id: true, nome: true, foto: true },
      });
      const mapaParceiros = new Map(parceiros.map((p) => [p.id, p]));

      const servicos = trocas.map((t) => {
        const souAnunciante = t.usuarioAId === usuarioId;
        const parceiroId = souAnunciante ? t.usuarioBId : t.usuarioAId;
        const { anuncio } = t;

        return {
          id: anuncio.id,
          titulo: anuncio.titulo,
          descricao: anuncio.descricao,
          preferencia: anuncio.preferencia,
          foto: anuncio.foto,
          disponibilidade: anuncio.disponibilidade,
          status: anuncio.status,
          cidade: anuncio.cidade,
          estado: anuncio.estado,
          categoria: { id: anuncio.categoria.id, nome: anuncio.categoria.nome },
          trocaId: t.id,
          finalizadaEm: t.atualizadoEm,
          papel: souAnunciante ? "anunciante" : "solicitante",
          parceiro: mapaParceiros.get(parceiroId) ?? null,
        };
      });

      return res.status(200).json({ servicos });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar serviços realizados" });
    }
  }
}

export default new AnuncioController();
