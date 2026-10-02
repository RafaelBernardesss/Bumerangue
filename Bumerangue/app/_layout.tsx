import { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { registrarPushToken } from "../services/RegistrarPushToken";

import { API_URL } from "../constants/api";
const INTERVALO_PING_MS = 30 * 1000;


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

 
  useEffect(() => {
    registrarPushToken();
  }, []);

  // Status online: avisa o servidor a cada 30s enquanto o app está aberto
  // e marca como offline quando o app vai para segundo plano.
  useEffect(() => {
    async function avisar(rota: "ping" | "offline") {
      try {
        const id = await AsyncStorage.getItem("usuarioId");
        if (!id) return;
        await fetch(`${API_URL}/usuarios/${id}/${rota}`, { method: "PUT" });
      } catch {
        // sem conexão: tenta de novo no próximo ciclo
      }
    }

    avisar("ping");

    const intervalo = setInterval(() => {
      if (AppState.currentState === "active") avisar("ping");
    }, INTERVALO_PING_MS);

    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") avisar("ping");
      else avisar("offline");
    });

    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, []);

 
  const ultimaResposta = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!ultimaResposta) return;

    const dados = ultimaResposta.notification.request.content.data as {
      tipo?: "proposta" | "troca";
      anuncioId?: number;
      outroUsuarioId?: number;
    };

    
    if (dados?.tipo === "troca" && dados.anuncioId && dados.outroUsuarioId) {
      router.push({
        pathname: "/FinalizandoTroca",
        params: {
          anuncioId: String(dados.anuncioId),
          outroUsuarioId: String(dados.outroUsuarioId),
        },
      });
    } else {
      router.push("/NotificacaoScreen");
    }
  }, [ultimaResposta]);

  return <Stack screenOptions={{ headerShown: false }} />;
}