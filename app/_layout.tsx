import * as Notifications from "expo-notifications";
import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data as any;
        if (data?.tipo === "CONV" && data?.convId) {
          router.push(`/Chat?id=${data.convId}`);
          return;
        }

        const body = response.notification.request.content.body as string | undefined;
        if (body) {
          const m = body.match(/CONV:(\d+)/);
          if (m) {
            router.push(`/Chat?id=${m[1]}`);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao processar resposta da notificação:", e);
      }
    });

    return () => sub.remove();
  }, []);

  return <Slot />;
}
