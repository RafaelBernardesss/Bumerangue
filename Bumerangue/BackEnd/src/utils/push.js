import prisma from "../prisma/client.js";

export async function enviarPush(usuarioId, { titulo, corpo, dados = {} }) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(usuarioId) },
      select: { pushToken: true },
    });

    const token = usuario?.pushToken;
    if (!token || !/^Expo(nent)?PushToken\[/.test(token)) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: token,
        title: titulo,
        body: corpo,
        sound: "default",
        channelId: "default",
        data: dados,
      }),
    });
  } catch (erro) {
    console.warn("[push] não foi possível enviar a notificação:", erro.message);
  }
}
