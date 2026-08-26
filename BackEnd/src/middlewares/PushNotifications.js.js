export async function enviarPushNotification(expoPushToken, titulo, mensagem, dados = {}) {
  if (!expoPushToken) return; // usuário nunca abriu o app ou negou permissão

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: titulo,
        body: mensagem,
        data: dados,
      }),
    });
  } catch (erro) {

    console.error("Erro ao enviar push notification:", erro);
  }
}