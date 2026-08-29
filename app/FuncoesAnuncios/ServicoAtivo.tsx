import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Flecha from "../../components/HeaderFlecha";

const API_URL = "http://192.168.137.111:3000";

type Anuncio = {
  id: number;
  titulo: string;
  descricao: string;
  preferencia: string;
  foto: string | null;
  disponibilidade: string | null;
  status: "ativo" | "vendido" | "pausado";
  cidade: string | null;
  estado: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuarioId: number;
  categoriaId: number;
  usuario: { id: number; nome: string; foto: string | null };
  categoria: { id: number; nome: string };
};

// Monta a URL completa da foto a partir do caminho relativo salvo no banco
function urlFoto(caminho: string | null) {
  if (!caminho) return null;
  return `${API_URL}/${caminho.replace(/\\/g, "/")}`;
}

// Rótulo e cor do status, mantendo a mesma paleta usada no resto do app
const CONFIG_STATUS: Record<Anuncio["status"], { label: string; cor: string }> = {
  ativo: { label: "ATIVO", cor: "#00AFFF" },
  pausado: { label: "PAUSADO", cor: "#FFB800" },
  vendido: { label: "TROCADO", cor: "#00FF44" },
};

function formatarData(iso: string) {
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

export default function ServicosAtivos() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  async function buscarMeusAnuncios() {
    try {
      setCarregando(true);
      const id = await AsyncStorage.getItem("usuarioId");
      if (!id) return;

      const resposta = await fetch(`${API_URL}/anuncios?usuarioId=${id}`);
      const dados = await resposta.json();

      if (resposta.ok) {
        setAnuncios(dados.anuncios || []);
      } else {
        console.log(dados.erro);
      }
    } catch (erro) {
      console.log(erro);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarMeusAnuncios();
    }, [])
  );

  function editarAnuncio(item: Anuncio) {
    router.push(`/EditarAnuncios?id=${item.id}`);
  }

  function confirmarExclusao(item: Anuncio) {
    Alert.alert(
      "Excluir anúncio",
      `Tem certeza que deseja excluir "${item.titulo}"? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirAnuncio(item.id),
        },
      ]
    );
  }

  async function excluirAnuncio(id: number) {
    setExcluindoId(id);
    try {
      const token = await AsyncStorage.getItem("token");
      const resposta = await fetch(`${API_URL}/anuncios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        Alert.alert("Erro", dados.erro || "Não foi possível excluir o anúncio.");
        return;
      }

      // Remove localmente sem precisar buscar tudo de novo
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (erro) {
      console.log(erro);
      Alert.alert("Erro", "Não foi possível excluir o anúncio. Tente novamente.");
    } finally {
      setExcluindoId(null);
    }
  }

  function renderAnuncio(item: Anuncio) {
    const statusKey = item.status as keyof typeof CONFIG_STATUS;
    if (!(statusKey in CONFIG_STATUS)) {
      console.warn(`[ServicoAtivo] anúncio ${item.id} com status inválido:`, item.status);
    }
    const statusCfg = CONFIG_STATUS[statusKey] ?? {
      label: (item.status ?? "").toString().toUpperCase(),
      cor: "#666",
    };
    const { label, cor } = statusCfg;
    const foto = urlFoto(item.foto);
    const excluindo = excluindoId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/AnuncioScreen?id=${item.id}`)}
      >
        <View style={styles.cardTopo}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.iconWrapper} />
          ) : (
            <View style={[styles.iconWrapper, { backgroundColor: "#161D2E" }]}>
              <Ionicons name="image-outline" size={22} color="#444" />
            </View>
          )}

          <View style={styles.cardTexto}>
            <Text style={styles.cardTitulo} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text style={styles.cardCliente} numberOfLines={1}>
              {item.categoria.nome}
            </Text>
          </View>
        </View>

        <View style={styles.cardRodape}>
          <View style={[styles.badge, { backgroundColor: `${cor}22` }]}>
            <Text style={[styles.badgeTexto, { color: cor }]}>{label}</Text>
          </View>
          <Text style={styles.cardPrazo}>Criado em {formatarData(item.criadoEm)}</Text>
        </View>

        <View style={styles.acoesWrapper}>
          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoEditar]}
            onPress={() => editarAnuncio(item)}
            disabled={excluindo}
          >
            <Ionicons name="create-outline" size={16} color="#00AFFF" />
            <Text style={styles.botaoEditarTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoAcao, styles.botaoExcluir]}
            onPress={() => confirmarExclusao(item)}
            disabled={excluindo}
          >
            {excluindo ? (
              <ActivityIndicator size="small" color="#FF3B6F" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color="#FF3B6F" />
                <Text style={styles.botaoExcluirTexto}>Excluir</Text>
              </>
            )}
          </TouchableOpacity>
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
          <Text style={styles.headerTitulo}>Meus Anúncios</Text>
          {anuncios.length > 0 && (
            <Text style={styles.headerSubtitulo}>
              {anuncios.length} {anuncios.length === 1 ? "anúncio" : "anúncios"}
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
        ) : anuncios.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={40} color="#444" />
            <Text style={styles.emptyTitulo}>Nenhum anúncio criado</Text>
            <Text style={styles.emptyTexto}>
              Os anúncios que você criar vão aparecer aqui.
            </Text>
          </View>
        ) : (
          anuncios.map(renderAnuncio)
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
    borderRadius: 12,
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
  cardRodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
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
  acoesWrapper: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  botaoAcao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  botaoEditar: {
    backgroundColor: "#00AFFF22",
  },
  botaoEditarTexto: {
    color: "#00AFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  botaoExcluir: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF3B6F",
  },
  botaoExcluirTexto: {
    color: "#FF3B6F",
    fontWeight: "700",
    fontSize: 13,
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