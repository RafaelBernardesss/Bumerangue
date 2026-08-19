import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Flecha from "../../components/HeaderFlecha";

type StatusServico = "andamento" | "aguardando" | "revisao" | "concluido";

type ServicoAtivo = {
  id: string;
  titulo: string;
  cliente: string;
  status: StatusServico;
  valor: string;
  prazo: string; // rótulo já formatado, ex: "Entrega em 3 dias"
  progresso: number; // 0 a 100
};

// Configuração visual por status, mantendo a mesma paleta usada na Home
// e na tela de Notificações (#00AFFF, #9B4DFF, #00FF44, #FF3B6F, #FFB800)
const CONFIG_STATUS: Record<
  StatusServico,
  { label: string; cor: string; icone: keyof typeof Ionicons.glyphMap }
> = {
  andamento: { label: "Em andamento", cor: "#00AFFF", icone: "sync-outline" },
  aguardando: {
    label: "Aguardando cliente",
    cor: "#FFB800",
    icone: "time-outline",
  },
  revisao: {
    label: "Em revisão",
    cor: "#9B4DFF",
    icone: "create-outline",
  },
  concluido: {
    label: "Concluído",
    cor: "#00FF44",
    icone: "checkmark-circle-outline",
  },
};

const SERVICOS_MOCK: ServicoAtivo[] = [
  {
    id: "1",
    titulo: "Criação de Sites",
    cliente: "Ana Beatriz",
    status: "andamento",
    valor: "R$ 850,00",
    prazo: "Entrega em 3 dias",
    progresso: 65,
  },
  {
    id: "2",
    titulo: "Desenvolvimento Web",
    cliente: "Carlos Eduardo",
    status: "aguardando",
    valor: "R$ 1.200,00",
    prazo: "Aguardando aprovação",
    progresso: 40,
  },
  {
    id: "3",
    titulo: "Criação de Logo",
    cliente: "Mariana Silva",
    status: "revisao",
    valor: "R$ 100,00",
    prazo: "Revisão solicitada",
    progresso: 85,
  },
  {
    id: "4",
    titulo: "Aulas de Física",
    cliente: "João Pedro",
    status: "andamento",
    valor: "R$ 60,00",
    prazo: "Próxima aula: amanhã",
    progresso: 50,
  },
  {
    id: "5",
    titulo: "Edição de Vídeo",
    cliente: "Fernanda Costa",
    status: "concluido",
    valor: "R$ 300,00",
    prazo: "Concluído hoje",
    progresso: 100,
  },
];

export default function ServicosAtivos() {
  const router = useRouter();
  const [servicos] = useState<ServicoAtivo[]>(SERVICOS_MOCK);

  const emAndamento = servicos.filter((s) => s.status !== "concluido");
  const concluidos = servicos.filter((s) => s.status === "concluido");

  function aoTocarServico(servico: ServicoAtivo) {
    router.push("/verAnuncio");
  }

  function renderServico(item: ServicoAtivo) {
    const { label, cor, icone } = CONFIG_STATUS[item.status];

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => aoTocarServico(item)}
      >
        <View style={styles.cardTopo}>
          <View style={[styles.iconWrapper, { backgroundColor: `${cor}22` }]}>
            <Ionicons name={icone} size={22} color={cor} />
          </View>

          <View style={styles.cardTexto}>
            <Text style={styles.cardTitulo} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text style={styles.cardCliente} numberOfLines={1}>
              {item.cliente}
            </Text>
          </View>

          <Text style={styles.cardValor}>{item.valor}</Text>
        </View>

        <View style={styles.progressoWrapper}>
          <View style={styles.progressoTrilha}>
            <View
              style={[
                styles.progressoPreenchido,
                { width: `${item.progresso}%`, backgroundColor: cor },
              ]}
            />
          </View>
          <Text style={styles.progressoTexto}>{item.progresso}%</Text>
        </View>

        <View style={styles.cardRodape}>
          <View style={[styles.badge, { backgroundColor: `${cor}22` }]}>
            <Text style={[styles.badgeTexto, { color: cor }]}>{label}</Text>
          </View>
          <Text style={styles.cardPrazo}>{item.prazo}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Flecha></Flecha>

        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitulo}>Serviços Ativos</Text>
          {emAndamento.length > 0 && (
            <Text style={styles.headerSubtitulo}>
              {emAndamento.length} em andamento
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {servicos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={40} color="#444" />
            <Text style={styles.emptyTitulo}>Nenhum serviço ativo</Text>
            <Text style={styles.emptyTexto}>
              Seus serviços em andamento vão aparecer aqui.
            </Text>
          </View>
        ) : (
          <>
            {emAndamento.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Em andamento</Text>
                {emAndamento.map(renderServico)}
              </>
            )}

            {concluidos.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Concluídos recentemente</Text>
                {concluidos.map(renderServico)}
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
    backgroundColor: "#0D1324",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "center",
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
  cardTitulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardCliente: {
    color: "#999",
    fontSize: 13,
    marginTop: 2,
  },
  cardValor: {
    color: "#00FF44",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  progressoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  progressoTrilha: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#161D2E",
    overflow: "hidden",
  },
  progressoPreenchido: {
    height: 6,
    borderRadius: 3,
  },
  progressoTexto: {
    color: "#666",
    fontSize: 12,
    marginLeft: 8,
    width: 34,
    textAlign: "right",
  },
  cardRodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardPrazo: {
    color: "#555",
    fontSize: 12,
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