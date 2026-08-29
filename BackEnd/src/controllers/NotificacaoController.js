import { enviarPushNotification } from "../middlewares/PushNotifications.js";
import prisma from "../prisma/Client.js";

/**
 * Lista as notificações do usuário autenticado, mais recentes primeiro.
 * Rota sugerida: GET /notificacoes
 */
export async function listarNotificacoes(req, res) {
  try {
    const idUsuario = req.usuarioId;

    const notificacoes = await prisma.notificacao.findMany({
      where: { usuarioId: idUsuario },
      orderBy: { criadoEm: "desc" },
      include: {
        solicitacao: { include: { anuncio: true, solicitante: true } },
      },
    });

    return res.status(200).json({ notificacoes });
  } catch (erro) {
    console.error("Erro ao listar notificações:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar as notificações." });
  }
}

/**
 * Aceita ou recusa uma solicitação de serviço a partir da notificação.
 * Se aceitar: anúncio sai da lista de "ativo" e vira um serviço em
 * andamento, visível tanto pro prestador quanto pro contratante.
 * Rota sugerida: PUT /notificacoes/:solicitacaoId/responder
 * Body esperado: { "resposta": "aceitar" } ou { "resposta": "recusar" }
 */
export async function responderSolicitacao(req, res) {
  try {
    const idSolicitacao = Number(req.params.solicitacaoId);
    const { resposta } = req.body;
    const idUsuario = req.usuarioId; // dono do anúncio, respondendo

    if (!idSolicitacao) {
      return res.status(400).json({ erro: "ID da solicitação não informado." });
    }

    if (resposta !== "aceitar" && resposta !== "recusar") {
      return res.status(400).json({ erro: 'Informe "resposta" como "aceitar" ou "recusar".' });
    }

    const solicitacao = await prisma.solicitacaoServico.findUnique({
      where: { id: idSolicitacao },
      include: { anuncio: true },
    });

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada." });
    }

    if (solicitacao.anuncio.usuarioId !== idUsuario) {
      return res.status(403).json({ erro: "Você não tem permissão para responder esta solicitação." });
    }

    if (solicitacao.status !== "pendente") {
      return res.status(400).json({ erro: "Esta solicitação já foi respondida." });
    }

    if (resposta === "recusar") {
      await prisma.solicitacaoServico.update({
        where: { id: idSolicitacao },
        data: { status: "recusada" },
      });

      await prisma.notificacao.updateMany({
        where: { solicitacaoId: idSolicitacao },
        data: { lida: true },
      });

      // Notifica o solicitante que a solicitação foi recusada
      try {
        const not = await prisma.notificacao.create({
          data: {
            usuarioId: solicitacao.solicitanteId,
            tipo: "info",
            mensagem: `Sua solicitação para o anúncio \"${solicitacao.anuncio.titulo}\" foi recusada.`,
            lida: false,
            solicitacaoId: idSolicitacao,
          },
        });

        const solicitanteUser = await prisma.usuario.findUnique({ where: { id: solicitacao.solicitanteId } });
        if (solicitanteUser?.expoPushToken) {
          enviarPushNotification(solicitanteUser.expoPushToken, "Solicitação recusada", not.mensagem, { tipo: "info", solicitacaoId: idSolicitacao });
        }
      } catch (e) {
        console.error("Erro ao notificar solicitante sobre recusa:", e);
      }

      return res.status(200).json({ mensagem: "Solicitação recusada." });
    }

    // resposta === "aceitar"
    const [, , servicoEmAndamento] = await prisma.$transaction([
      prisma.solicitacaoServico.update({
        where: { id: idSolicitacao },
        data: { status: "aceita" },
      }),
      prisma.anuncio.update({
        where: { id: solicitacao.anuncioId },
        data: { status: "em_andamento" },
      }),
      prisma.servicoEmAndamento.create({
        data: {
          anuncioId: solicitacao.anuncioId,
          prestadorId: solicitacao.anuncio.usuarioId,
          contratanteId: solicitacao.solicitanteId,
        },
      }),
    ]);

    await prisma.notificacao.updateMany({
      where: { solicitacaoId: idSolicitacao },
      data: { lida: true },
    });

    // Cria uma conversa no banco (agora usando modelo Prisma) para que dono e solicitante conversem
    try {
      const conv = await prisma.conversa.create({
        data: {
          solicitacaoId: idSolicitacao,
          donoId: solicitacao.anuncio.usuarioId,
          solicitanteId: solicitacao.solicitanteId,
        },
      });

      if (conv?.id) {
          const not = await prisma.notificacao.create({
            data: {
              usuarioId: solicitacao.solicitanteId,
              tipo: "info",
              mensagem: `Sua solicitação foi aceita. Abra a conversa: CONV:${conv.id}`,
              lida: false,
              solicitacaoId: idSolicitacao,
            },
          });

          // enviar push com dados da conversa para abrir o chat no app
          try {
            const solicitanteUser = await prisma.usuario.findUnique({ where: { id: solicitacao.solicitanteId } });
            if (solicitanteUser?.expoPushToken) {
              enviarPushNotification(solicitanteUser.expoPushToken, "Solicitação aceita", not.mensagem, { tipo: "CONV", convId: conv.id });
            }
          } catch (e) {
            console.error("Erro ao enviar push de conversa:", e);
          }
      }
    } catch (e) {
      console.error("Erro ao criar conversa/notificação de aceite:", e);
    }

    return res.status(200).json({
      mensagem: "Solicitação aceita.",
      servicoEmAndamento,
    });
  } catch (erro) {
    console.error("Erro ao responder solicitação:", erro);
    return res.status(500).json({ erro: "Erro interno ao responder a solicitação." });
  }
}

/**
 * Lista os serviços em andamento do usuário autenticado (como prestador
 * ou como contratante).
 * Rota sugerida: GET /notificacoes/servicos-em-andamento
 */
export async function listarServicosEmAndamento(req, res) {
  try {
    const idUsuario = req.usuarioId;

    const servicos = await prisma.servicoEmAndamento.findMany({
      where: { OR: [{ prestadorId: idUsuario }, { contratanteId: idUsuario }] },
      orderBy: { criadoEm: "desc" },
      include: { anuncio: true, prestador: true, contratante: true },
    });

    return res.status(200).json({ servicos });
  } catch (erro) {
    console.error("Erro ao listar serviços em andamento:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar os serviços em andamento." });
  }
}

/**
 * Salva/atualiza o Expo Push Token do usuário logado, usado pra
 * mandar push notification pro celular dele.
 * Rota sugerida: POST /notificacoes/push-token
 * Body esperado: { "expoPushToken": "ExponentPushToken[xxxxxxx]" }
 */
export async function salvarPushToken(req, res) {
  try {
    const idUsuario = req.usuarioId;
    const { expoPushToken } = req.body;

    if (!expoPushToken) {
      return res.status(400).json({ erro: "Token não informado." });
    }

    await prisma.usuario.update({
      where: { id: idUsuario },
      data: { expoPushToken },
    });

    return res.status(200).json({ mensagem: "Token salvo com sucesso." });
  } catch (erro) {
    console.error("Erro ao salvar push token:", erro);
    return res.status(500).json({ erro: "Erro interno ao salvar o token." });
  }
}

/**
 * Exclui uma notificação do usuário autenticado.
 * Rota sugerida: DELETE /notificacoes/:id
 */
export async function excluirNotificacao(req, res) {
  try {
    const idNotificacao = Number(req.params.id);
    const idUsuario = req.usuarioId;

    if (!idNotificacao) {
      return res.status(400).json({ erro: "ID da notificação não informado." });
    }

    const notificacao = await prisma.notificacao.findUnique({
      where: { id: idNotificacao },
    });

    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada." });
    }

    if (notificacao.usuarioId !== idUsuario) {
      return res.status(403).json({ erro: "Você não tem permissão para excluir esta notificação." });
    }

    await prisma.notificacao.delete({
      where: { id: idNotificacao },
    });

    return res.status(200).json({ mensagem: "Notificação excluída com sucesso." });
  } catch (erro) {
    console.error("Erro ao excluir notificação:", erro);
    return res.status(500).json({ erro: "Erro interno ao excluir a notificação." });
  }
}