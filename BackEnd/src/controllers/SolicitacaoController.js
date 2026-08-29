import { enviarPushNotification } from "../middlewares/PushNotifications.js";
import prisma from "../prisma/Client.js";

/**
 * Cria uma solicitação de troca de serviço para um anúncio, e gera
 * a notificação correspondente para o dono do anúncio.
 * Rota: POST /anuncios/:id/solicitar
 * Body esperado: { "servicoOferecido": string, "mensagem": string }
 */
export async function solicitarServico(req, res) {
  try {
    const anuncioId = Number(req.params.id);
    const { servicoOferecido, mensagem } = req.body;
    const solicitanteId = req.usuarioId;

    // Validações adicionais para evitar erros inesperados
    if (!solicitanteId) {
      return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    if (!anuncioId) {
      return res.status(400).json({ erro: "ID do anúncio não informado." });
    }

    if (!servicoOferecido || !servicoOferecido.trim()) {
      return res.status(400).json({ erro: "Informe o serviço oferecido em troca." });
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioId },
      include: { usuario: true },
    });

    if (!anuncio) {
      return res.status(404).json({ erro: "Anúncio não encontrado." });
    }

    if (anuncio.usuarioId === solicitanteId) {
      return res.status(400).json({ erro: "Você não pode enviar uma proposta para o seu próprio anúncio." });
    }

    if (anuncio.status !== "ativo") {
      return res.status(400).json({ erro: "Este anúncio não está disponível no momento." });
    }

    const solicitante = await prisma.usuario.findUnique({ where: { id: solicitanteId } });

    // Log para diagnóstico: quem pede, qual anúncio e dados enviados
    console.log(`[Solicitacao] solicitanteId=${solicitanteId} anuncioId=${anuncioId} servico="${servicoOferecido?.slice(0,100)}" mensagemLen=${mensagem?.length || 0}`);

    const solicitacao = await prisma.$transaction(async (tx) => {
      // Criar solicitação apenas com campos existentes no schema
      const novaSolicitacao = await tx.solicitacaoServico.create({
        data: {
          anuncioId,
          solicitanteId,
          status: "pendente",
        },
      });

      // Mensagem da notificação inclui o serviço oferecido e a mensagem opcional
      const textoNotificacao = `${solicitante?.nome ?? "Alguém"} quer trocar "${(servicoOferecido || "")}" pelo seu serviço "${anuncio.titulo}".${mensagem ? "\nMensagem: " + mensagem.trim() : ""}`;

      try {
        await tx.notificacao.create({
          data: {
            usuarioId: anuncio.usuarioId,
            tipo: "nova_solicitacao",
            mensagem: textoNotificacao,
            lida: false,
            solicitacaoId: novaSolicitacao.id,
          },
        });
      } catch (e) {
        console.warn("Falha ao criar notificação vinculada (possível unique), criando sem solicitacaoId:", e.message);
        await tx.notificacao.create({
          data: {
            usuarioId: anuncio.usuarioId,
            tipo: "nova_solicitacao",
            mensagem: textoNotificacao,
            lida: false,
          },
        });
      }

      // Também notifica o solicitante que a solicitação foi enviada e está pendente
      try {
        await tx.notificacao.create({
          data: {
            usuarioId: solicitanteId,
            tipo: "info",
            mensagem: `Sua solicitação para o anúncio "${anuncio.titulo}" foi enviada e está pendente.`,
            lida: false,
            solicitacaoId: novaSolicitacao.id,
          },
        });
      } catch (e) {
        console.warn("Falha ao criar notificação do solicitante vinculada (possível unique), criando sem solicitacaoId:", e.message);
        await tx.notificacao.create({
          data: {
            usuarioId: solicitanteId,
            tipo: "info",
            mensagem: `Sua solicitação para o anúncio "${anuncio.titulo}" foi enviada e está pendente.`,
            lida: false,
          },
        });
      }

      return novaSolicitacao;
    });

    // Enviar push notifications (fora da transação)
    try {
      const dono = await prisma.usuario.findUnique({ where: { id: anuncio.usuarioId } });
      const solicitanteUser = await prisma.usuario.findUnique({ where: { id: solicitanteId } });

      const textoNotificacao = `${solicitante?.nome ?? "Alguém"} quer trocar "${(servicoOferecido || "")}" pelo seu serviço "${anuncio.titulo}".${mensagem ? "\nMensagem: " + mensagem.trim() : ""}`;

      if (dono?.expoPushToken) {
        enviarPushNotification(dono.expoPushToken, "Nova solicitação de serviço", textoNotificacao, {
          tipo: "nova_solicitacao",
          solicitacaoId: solicitacao.id,
        });
      }

      if (solicitanteUser?.expoPushToken) {
        enviarPushNotification(solicitanteUser.expoPushToken, "Solicitação enviada", `Sua solicitação para o anúncio \"${anuncio.titulo}\" foi enviada e está pendente.`, {
          tipo: "info",
          solicitacaoId: solicitacao.id,
        });
      }
    } catch (e) {
      console.error("Erro ao enviar push notifications de solicitação:", e);
    }
    return res.status(201).json({ mensagem: "Proposta enviada com sucesso.", solicitacao });
  } catch (erro) {
    console.error("Erro ao solicitar serviço:", erro);
    // Retorna detalhes reduzidos para diagnóstico (remova em produção)
    return res.status(500).json({ erro: "Erro interno ao enviar a proposta.", details: erro.message, stack: (erro.stack || "").split("\n").slice(0,5) });
  }
}