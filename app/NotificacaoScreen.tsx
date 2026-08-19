import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Flecha from "../components/HeaderFlecha";

type TipoNotificacao =
  | "servico"
  | "mensagem"
  | "favorito"
  | "trocas"
  | "sistema";

type Notificacao = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  data: string; // rótulo já formatado, ex: "Agora", "2h atrás", "Ontem"
  lida: boolean;
};

// Configuração visual por tipo de notificação (ícone + cor), mantendo a
// mesma paleta usada na Home (#00AFFF, #9B4DFF, #00FF44, #FF3B6F...)
const CONFIG_TIPO: Record<
  TipoNotificacao,
  { icone: keyof typeof Ionicons.glyphMap; cor: string }
> = {
  servico: { icone: "briefcase-outline", cor: "#00AFFF" },
  mensagem: { icone: "chatbubble-outline", cor: "#9B4DFF" },
  favorito: { icone: "heart", cor: "#FF3B6F" },
  trocas: { icone: "cash-outline", cor: "#00FF44" },
  sistema: { icone: "notifications-outline", cor: "#FFB800" },
};

const NOTIFICACOES_MOCK: Notificacao[] = [
  {
    id: "1",
    tipo: "servico",
    titulo: "Proposta aceita",
    descricao: "Sua proposta para 'Criação de Sites' foi aceita pelo cliente.",
    data: "Agora",
    lida: false,
  },
  {
    id: "2",
    tipo: "mensagem",
    titulo: "Nova mensagem",
    descricao: "Ana enviou uma mensagem sobre o serviço de Desenvolvimento Web.",
    data: "12 min atrás",
    lida: false,
  },
  {
    id: "3",
    tipo: "trocas",
    titulo: "Pagamento recebido",
    descricao: "Você recebeu R$ 100,00 pelo serviço 'Criação de Logo'.",
    data: "2h atrás",
    lida: false,
  },
  {
    id: "4",
    tipo: "favorito",
    titulo: "Novo favorito",
    descricao: "Carlos adicionou seu perfil aos favoritos dele.",
    data: "Ontem",
    lida: true,
  },
  {
    id: "5",
    tipo: "sistema",
    titulo: "Atualize seu perfil",
    descricao: "Complete seu perfil para aparecer mais nas buscas.",
    data: "Ontem",
    lida: true,
  },
  {
    id: "6",
    tipo: "servico",
    titulo: "Serviço concluído",
    descricao: "'Aulas de Física' foi marcado como concluído.",
    data: "2 dias atrás",
    lida: true,
  },
];

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(
    NOTIFICACOES_MOCK
  );

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const hoje = notificacoes.filter((n) =>
    ["Agora", "12 min atrás", "2h atrás"].includes(n.data)
  );
  const anteriores = notificacoes.filter((n) => !hoje.includes(n));

  function marcarComoLida(id: string) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  function marcarTodasComoLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  function removerNotificacao(id: string) {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }

  function aoTocarNotificacao(notificacao: Notificacao) {
    if (!notificacao.lida) marcarComoLida(notificacao.id);

    switch (notificacao.tipo) {
      case "mensagem":
        router.push("/Chat");
        break;
      case "servico":
        router.push("/verAnuncio");
        break;
      case "favorito":
        router.push("/perfil");
        break;
      default:
        break;
    }
  }

  function renderNotificacao(item: Notificacao) {
    const { icone, cor } = CONFIG_TIPO[item.tipo];

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, !item.lida && styles.cardNaoLida]}
        activeOpacity={0.7}
        onPress={() => aoTocarNotificacao(item)}
      >
        <View style={[styles.iconWrapper, { backgroundColor: `${cor}22` }]}>
          <Ionicons name={icone} size={22} color={cor} />
        </View>

        <View style={styles.cardTexto}>
          <View style={styles.cardTopo}>
            <Text style={styles.cardTitulo} numberOfLines={1}>
              {item.titulo}
            </Text>
            {!item.lida && <View style={styles.dot} />}
          </View>
          <Text style={styles.cardDescricao} numberOfLines={2}>
            {item.descricao}
          </Text>
          <Text style={styles.cardData}>{item.data}</Text>
        </View>

        <TouchableOpacity
          style={styles.removerButton}
          onPress={() => removerNotificacao(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color="#555" />
        </TouchableOpacity>
      </TouchableOpacity>
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

        <TouchableOpacity
          onPress={marcarTodasComoLidas}
          disabled={naoLidas === 0}
        >
          <Text
            style={[
              styles.marcarTodas,
              naoLidas === 0 && styles.marcarTodasDesativado,
            ]}
          >
            Marcar todas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notificacoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={40} color="#444" />
            <Text style={styles.emptyTitulo}>Nenhuma notificação</Text>
            <Text style={styles.emptyTexto}>
              Você está em dia! Volte mais tarde para novidades.
            </Text>
          </View>
        ) : (
          <>
            {hoje.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Hoje</Text>
                {hoje.map(renderNotificacao)}
              </>
            )}

            {anteriores.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Anteriores</Text>
                {anteriores.map(renderNotificacao)}
              </>
            )}
          </>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
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
  marcarTodas: {
    color: "#00AFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  marcarTodasDesativado: {
    color: "#444",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 12,
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
  removerButton: {
    padding: 4,
    marginLeft: 8,
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