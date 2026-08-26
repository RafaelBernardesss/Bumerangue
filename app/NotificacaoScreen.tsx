import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import Flecha from "../components/HeaderFlecha";

const API_URL = "http://192.168.137.70:3000"; // troque pela URL da sua API

// Faz o push aparecer como banner mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // mostra o banner com o app aberto
    shouldShowList: true, // mostra na lista/central de notificações
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Solicitacao = {
  id: number;
  status: "pendente" | "aceita" | "recusada";
  anuncio: { id: number; titulo: string };
  solicitante: { id: number; nome: string };
};

type Notificacao = {
  id: number;
  tipo: "nova_solicitacao" | "info";
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  solicitacao?: Solicitacao | null;
};

// Ícone/cor por tipo, mantendo a paleta usada no resto do app
const CONFIG_TIPO: Record<string, { icone: keyof typeof Ionicons.glyphMap; cor: string }> = {
  nova_solicitacao: { icone: "briefcase-outline", cor: "#00AFFF" },
  info: { icone: "notifications-outline", cor: "#FFB800" },
};

function formatarData(iso: string) {
  const data = new Date(iso);
  const agora = new Date();
  const diffMin = Math.floor((agora.getTime() - data.getTime()) / 60000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)}h atrás`;
  if (diffMin < 48 * 60) return "Ontem";
  return data.toLocaleDateString("pt-BR");
}

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [respondendoId, setRespondendoId] = useState<number | null>(null);
  const registrouPush = useRef(false);

  async function buscarNotificacoes() {
    try {
      const token = await AsyncStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/notificacoes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await resposta.json();
      setNotificacoes(dados.notificacoes ?? []);
    } catch (erro) {
      console.error("Erro ao buscar notificações:", erro);
    } finally {
      setCarregando(false);
    }
  }

  // Pede permissão, pega o Expo Push Token e manda salvar no back-end.
  // Só faz isso uma vez por sessão da tela.
  async function registrarPushToken() {
    if (registrouPush.current || !Device.isDevice) return;
    registrouPush.current = true;

    const { status: statusAtual } = await Notifications.getPermissionsAsync();
    let statusFinal = statusAtual;

    if (statusAtual !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      statusFinal = status;
    }

    if (statusFinal !== "granted") return; // usuário negou, segue sem push

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.error("projectId não encontrado. Veja o app.json/eas.json do projeto.");
      return;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = await AsyncStorage.getItem("token");

    await fetch(`${API_URL}/notificacoes/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expoPushToken }),
    });

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarNotificacoes();
      registrarPushToken();

      // Recarrega a lista quando chega um push com o app aberto
      const subscription = Notifications.addNotificationReceivedListener(() => {
        buscarNotificacoes();
      });

      return () => subscription.remove();
    }, [])
  );

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  async function responder(solicitacaoId: number, resposta: "aceitar" | "recusar") {
    setRespondendoId(solicitacaoId);
    try {
      const token = await AsyncStorage.getItem("token");
      const resp = await fetch(`${API_URL}/notificacoes/${solicitacaoId}/responder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resposta }),
      });

      if (!resp.ok) {
        const erro = await resp.json();
        console.error(erro.erro);
        return;
      }

      // Atualiza local sem precisar buscar tudo de novo
      setNotificacoes((prev) =>
        prev.map((n) =>
          n.solicitacao?.id === solicitacaoId
            ? {
                ...n,
                lida: true,
                solicitacao: {
                  ...n.solicitacao!,
                  status: resposta === "aceitar" ? "aceita" : "recusada",
                },
              }
            : n
        )
      );

      if (resposta === "aceitar") {
        router.push("/FuncoesAnuncios/ServicoAtivo");
      }
    } catch (erro) {
      console.error("Erro ao responder solicitação:", erro);
    } finally {
      setRespondendoId(null);
    }
  }

  function renderNotificacao(item: Notificacao) {
    const { icone, cor } = CONFIG_TIPO[item.tipo] ?? CONFIG_TIPO.info;
    const solicitacaoPendente =
      item.tipo === "nova_solicitacao" && item.solicitacao?.status === "pendente";

    return (
      <View key={item.id} style={[styles.card, !item.lida && styles.cardNaoLida]}>
        <View style={[styles.iconWrapper, { backgroundColor: `${cor}22` }]}>
          <Ionicons name={icone} size={22} color={cor} />
        </View>

        <View style={styles.cardTexto}>
          <View style={styles.cardTopo}>
            <Text style={styles.cardTitulo} numberOfLines={1}>
              {item.tipo === "nova_solicitacao" ? "Nova solicitação de serviço" : "Notificação"}
            </Text>
            {!item.lida && <View style={styles.dot} />}
          </View>
          <Text style={styles.cardDescricao} numberOfLines={2}>
            {item.mensagem}
          </Text>
          <Text style={styles.cardData}>{formatarData(item.criadoEm)}</Text>

          {solicitacaoPendente && (
            <View style={styles.acoesWrapper}>
              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoAceitar]}
                disabled={respondendoId === item.solicitacao!.id}
                onPress={() => responder(item.solicitacao!.id, "aceitar")}
              >
                {respondendoId === item.solicitacao!.id ? (
                  <ActivityIndicator size="small" color="#0B0B0B" />
                ) : (
                  <Text style={styles.botaoAceitarTexto}>Aceitar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoRecusar]}
                disabled={respondendoId === item.solicitacao!.id}
                onPress={() => responder(item.solicitacao!.id, "recusar")}
              >
                <Text style={styles.botaoRecusarTexto}>Recusar</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.tipo === "nova_solicitacao" && item.solicitacao?.status === "aceita" && (
            <Text style={styles.statusAceito}>Aceita</Text>
          )}
          {item.tipo === "nova_solicitacao" && item.solicitacao?.status === "recusada" && (
            <Text style={styles.statusRecusado}>Recusada</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Flecha></Flecha>

        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitulo}>Notificações</Text>
          {naoLidas > 0 && (
            <Text style={styles.headerSubtitulo}>
              {naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {carregando ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#00AFFF" />
        ) : notificacoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={40} color="#444" />
            <Text style={styles.emptyTitulo}>Nenhuma notificação</Text>
            <Text style={styles.emptyTexto}>
              Você está em dia! Volte mais tarde para novidades.
            </Text>
          </View>
        ) : (
          notificacoes.map(renderNotificacao)
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTextWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitulo: {
    color: "#00AFFF",
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0D1324",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  cardNaoLida: {
    borderColor: "#00AFFF44",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTexto: {
    flex: 1,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitulo: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00AFFF",
    marginLeft: 8,
  },
  cardDescricao: {
    color: "#999",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  cardData: {
    color: "#555",
    fontSize: 12,
    marginTop: 8,
  },
  acoesWrapper: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  botaoAcao: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  botaoAceitar: {
    backgroundColor: "#00AFFF",
  },
  botaoAceitarTexto: {
    color: "#0B0B0B",
    fontWeight: "700",
    fontSize: 13,
  },
  botaoRecusar: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF3B6F",
  },
  botaoRecusarTexto: {
    color: "#FF3B6F",
    fontWeight: "700",
    fontSize: 13,
  },
  statusAceito: {
    marginTop: 10,
    color: "#00FF44",
    fontSize: 13,
    fontWeight: "600",
  },
  statusRecusado: {
    marginTop: 10,
    color: "#FF3B6F",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitulo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyTexto: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});