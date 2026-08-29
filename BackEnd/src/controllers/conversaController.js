import prisma from "../prisma/Client.js";

export async function listarMensagens(req, res) {
  try {
    const conversaId = Number(req.params.id);
    const idUsuario = req.usuarioId;

    if (!conversaId) return res.status(400).json({ erro: "ID da conversa não informado." });

    const conv = await prisma.conversa.findUnique({ where: { id: conversaId } });
    if (!conv) return res.status(404).json({ erro: "Conversa não encontrada." });
    if (conv.donoId !== idUsuario && conv.solicitanteId !== idUsuario)
      return res.status(403).json({ erro: "Você não tem permissão." });

    const mensagens = await prisma.mensagem.findMany({
      where: { conversaId },
      orderBy: { criadoEm: "asc" },
    });

    return res.status(200).json({ mensagens });
  } catch (erro) {
    console.error("Erro ao listar mensagens:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar mensagens." });
  }
}

export async function enviarMensagem(req, res) {
  try {
    const conversaId = Number(req.params.id);
    const idUsuario = req.usuarioId;
    const { texto } = req.body;

    if (!conversaId) return res.status(400).json({ erro: "ID da conversa não informado." });
    if (!texto || !texto.trim()) return res.status(400).json({ erro: "Texto vazio." });

    const conv = await prisma.conversa.findUnique({ where: { id: conversaId } });
    if (!conv) return res.status(404).json({ erro: "Conversa não encontrada." });
    if (conv.donoId !== idUsuario && conv.solicitanteId !== idUsuario)
      return res.status(403).json({ erro: "Você não tem permissão." });

    const mensagem = await prisma.mensagem.create({
      data: {
        conversaId,
        remetenteId: idUsuario,
        texto,
      },
    });

    return res.status(201).json({ mensagem });
  } catch (erro) {
    console.error("Erro ao enviar mensagem:", erro);
    return res.status(500).json({ erro: "Erro interno ao enviar mensagem." });
  }
}

export async function excluirConversa(req, res) {
  try {
    const conversaId = Number(req.params.id);
    const idUsuario = req.usuarioId;

    if (!conversaId) return res.status(400).json({ erro: "ID da conversa não informado." });

    const conv = await prisma.conversa.findUnique({ where: { id: conversaId } });
    if (!conv) return res.status(404).json({ erro: "Conversa não encontrada." });
    if (conv.donoId !== idUsuario && conv.solicitanteId !== idUsuario)
      return res.status(403).json({ erro: "Você não tem permissão." });

    await prisma.mensagem.deleteMany({ where: { conversaId } });
    await prisma.conversa.delete({ where: { id: conversaId } });

    return res.status(200).json({ mensagem: "Conversa excluída." });
  } catch (erro) {
    console.error("Erro ao excluir conversa:", erro);
    return res.status(500).json({ erro: "Erro interno ao excluir conversa." });
  }
}
