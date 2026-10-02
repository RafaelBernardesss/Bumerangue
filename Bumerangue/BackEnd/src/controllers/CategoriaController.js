import prisma from "../prisma/client.js";

class CategoriaController {
  async Listar(req, res) {
    try {
      const categorias = await prisma.categoria.findMany({ orderBy: { nome: "asc" } });
      return res.status(200).json({ categorias });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao listar categorias" });
    }
  }

  async Criar(req, res) {
    try {
      const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

      if (nome.length < 2) {
        return res.status(400).json({ erro: "Informe o nome da categoria (mínimo 2 caracteres)." });
      }

      const existente = await prisma.categoria.findUnique({ where: { nome } });
      if (existente) {
        return res.status(409).json({ erro: "Essa categoria já existe." });
      }

      const categoria = await prisma.categoria.create({ data: { nome } });
      return res.status(201).json({ categoria });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao criar categoria" });
    }
  }

  async Excluir(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ erro: "ID da categoria inválido." });

      const categoria = await prisma.categoria.findUnique({
        where: { id },
        include: { _count: { select: { anuncios: true } } },
      });

      if (!categoria) return res.status(404).json({ erro: "Categoria não encontrada." });

      if (categoria._count.anuncios > 0) {
        return res.status(400).json({
          erro: "Não é possível remover: existem anúncios usando essa categoria.",
        });
      }

      await prisma.categoria.delete({ where: { id } });
      return res.status(200).json({ mensagem: "Categoria removida com sucesso." });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao remover categoria" });
    }
  }
}

export default new CategoriaController();
