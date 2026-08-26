import prisma from "../prisma/Client.js";
import { enviarPushNotification } from "../services/pushNotifications.js";

/**
 * Cria uma solicitação de serviço para um anúncio, gera a notificação no
 * banco e envia um push notification pro celular do dono do anúncio.
 * Rota sugerida: POST /anuncios/:anuncioId/solicitar
 * Requer usuário autenticado (req.usuarioId).
 */
export async function criarSolicitacao(req, res) {
  try {
    const idAnuncio = Number(req.params.anuncioId);
    const idSolicitante = req.usuarioId;

    if (!idAnuncio) {
      return res.status(400).json({ erro: "ID do anúncio não informado." });
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: idAnuncio },
      include: { usuario: true }, // precisa do usuario pra pegar o expoPushToken
    });

    if (!anuncio) {
      return res.status(404).json({ erro: "Anúncio não encontrado." });
    }

    if (anuncio.status !== "ativo") {
      return res.status(400).json({ erro: "Este anúncio não está mais disponível." });
    }

    if (anuncio.usuarioId === idSolicitante) {
      return res.status(400).json({ erro: "Você não pode solicitar seu próprio anúncio." });
    }

    const solicitacaoExistente = await prisma.solicitacaoServico.findFirst({
      where: { anuncioId: idAnuncio, solicitanteId: idSolicitante, status: "pendente" },
    });

    if (solicitacaoExistente) {
      return res.status(409).json({ erro: "Você já enviou uma solicitação para este anúncio." });
    }

    const solicitacao = await prisma.solicitacaoServico.create({
      data: {
        anuncioId: idAnuncio,
        solicitanteId: idSolicitante,
        status: "pendente",
      },
    });

    // Notificação vai só pro dono do anúncio, nunca pra quem solicitou
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId: anuncio.usuarioId,
        solicitacaoId: solicitacao.id,
        tipo: "nova_solicitacao",
        mensagem: `Alguém quer contratar o serviço "${anuncio.titulo}".`,
      },
    });

    // Push no celular do dono do anúncio. "data" leva o id da solicitação
    // pra o app saber qual notificação abrir quando o usuário tocar no push.
    await enviarPushNotification(
      anuncio.usuario.expoPushToken,
      "Nova solicitação de serviço",
      `Alguém quer contratar o serviço "${anuncio.titulo}".`,
      { notificacaoId: notificacao.id, solicitacaoId: solicitacao.id }
    );

    return res.status(201).json({
      mensagem: "Solicitação enviada com sucesso.",
      solicitacao,
      notificacao,
    });
  } catch (erro) {
    console.error("Erro ao criar solicitação:", erro);
    return res.status(500).json({ erro: "Erro interno ao criar a solicitação." });
  }
}