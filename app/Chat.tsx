import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://192.168.137.111:3000";

type Mensagem = {
  id: number;
  texto: string;
  criadoEm: string;
  // Ajuste o nome do campo abaixo conforme o retorno real da sua API
  // (é ele que diz quem enviou a mensagem, pra saber de que lado exibir o balão)
  remetenteId: number;
  lida?: boolean;
};

// Monta a URL completa da foto a partir do caminho relativo salvo no banco
function urlFoto(caminho: string | null | undefined) {
  if (!caminho) return null;
  return `${API_URL}/${caminho.replace(/\\/g, "/")}`;
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDivisorData(data: string) {
  const hoje = new Date();
  const d = new Date(data);
  const mesmoDia = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (mesmoDia(d, hoje)) return "Hoje";
  if (mesmoDia(d, ontem)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

export default function Chat() {
  const { id, nome, foto } = useLocalSearchParams<{
    id: string;
    nome?: string;
    foto?: string;
  }>();
  const router = useRouter();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [online, setOnline] = useState(true); // TODO: trocar pelo status real vindo do backend

  const listRef = useRef<FlatList<Mensagem>>(null);

  useEffect(() => {
    AsyncStorage.getItem("usuarioId").then(setMeuId);
  }, []);

  useEffect(() => {
    if (!id) return;
    buscarMensagens();
  }, [id]);

  async function buscarMensagens() {
    try {
      const token = await AsyncStorage.getItem("token");
      const resp = await fetch(`${API_URL}/conversas/${id}/mensagens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await resp.json();
      setMensagens(dados.mensagens || []);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: false }), 50);
    } catch (e) {
      console.error("Erro ao buscar mensagens:", e);
    }
  }

  async function enviar() {
    if (!texto.trim()) return;
    try {
      setEnviando(true);
      const token = await AsyncStorage.getItem("token");
      const resp = await fetch(`${API_URL}/conversas/${id}/mensagens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto }),
      });
      if (!resp.ok) {
        const d = await resp.json();
        throw new Error(d.erro || "Erro ao enviar");
      }
      const data = await resp.json();
      setMensagens((prev) => [...prev, data.mensagem]);
      setTexto("");
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Erro", msg || "Não foi possível enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExcluir() {
    Alert.alert("Excluir conversa", "Deseja excluir esta conversa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: excluirConversa },
    ]);
  }

  async function excluirConversa() {
    try {
      const token = await AsyncStorage.getItem("token");
      const resp = await fetch(`${API_URL}/conversas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const d = await resp.json();
        throw new Error(d.erro || "Erro ao excluir");
      }
      Alert.alert("Conversa excluída");
      router.back();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Erro", msg || "Não foi possível excluir conversa.");
    }
  }

  const fotoContato = urlFoto(foto);
  const iniciaisContato = (nome || "?")
    .toString()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  function renderItem({ item, index }: { item: Mensagem; index: number }) {
    const minha = meuId != null && String(item.remetenteId) === String(meuId);

    const anterior = mensagens[index - 1];
    const mostrarDivisorData =
      !anterior ||
      formatarDivisorData(anterior.criadoEm) !== formatarDivisorData(item.criadoEm);

    return (
      <View>
        {mostrarDivisorData && (
          <View style={styles.dateDividerWrapper}>
            <View style={styles.dateDivider}>
              <Text style={styles.dateDividerText}>
                {formatarDivisorData(item.criadoEm)}
              </Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.msgRow,
            { justifyContent: minha ? "flex-end" : "flex-start" },
          ]}
        >
          <View
            style={[
              styles.msgBubble,
              minha ? styles.msgBubbleMinha : styles.msgBubbleOutra,
            ]}
          >
            <Text style={minha ? styles.msgTextMinha : styles.msgText}>
              {item.texto}
            </Text>
            <View style={styles.msgFooter}>
              <Text
                style={minha ? styles.msgTimeMinha : styles.msgTime}
              >
                {formatarHora(item.criadoEm)}
              </Text>
              {minha && (
                <Ionicons
                  name={item.lida ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={item.lida ? "#0B0B0B" : "rgba(11,11,11,0.6)"}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: "/perfilUsuario", params: { id: String(id) } } as any)}
        >
          <View style={styles.avatarWrapper}>
            {fotoContato ? (
              <Image source={{ uri: fotoContato }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {iniciaisContato}
                </Text>
              </View>
            )}
            {online && <View style={styles.onlineDot} />}
          </View>

          <View style={{ marginLeft: 12, flexShrink: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {nome || "Contato"}
            </Text>
            <Text style={styles.headerStatus}>
              {online ? "Online agora" : "Offline"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmarExcluir} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MENSAGENS */}
      {mensagens.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={36} color="#444" />
          <Text style={styles.emptyText}>
            Nenhuma mensagem ainda.{"\n"}Comece a conversa!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={mensagens}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add" size={24} color="#999" />
        </TouchableOpacity>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor="#666"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { opacity: texto.trim() && !enviando ? 1 : 0.5 },
          ]}
          onPress={enviar}
          disabled={!texto.trim() || enviando}
        >
          <Ionicons name="send" size={20} color="#0B0B0B" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    marginTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#161D2E",
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#00AFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00FF44",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  headerName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  headerStatus: {
    color: "#00FF44",
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  dateDividerWrapper: {
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  dateDivider: {
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#161D2E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dateDividerText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  msgBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleOutra: {
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#161D2E",
    borderBottomLeftRadius: 4,
  },
  msgBubbleMinha: {
    backgroundColor: "#00AFFF",
    borderBottomRightRadius: 4,
  },
  msgText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
  },
  msgTextMinha: {
    color: "#0B0B0B",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  msgFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  msgTime: {
    color: "#666",
    fontSize: 11,
  },
  msgTimeMinha: {
    color: "rgba(11,11,11,0.6)",
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#161D2E",
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#161D2E",
    justifyContent: "center",
    alignItems: "center",
  },
  inputBox: {
    flex: 1,
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#161D2E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    justifyContent: "center",
    maxHeight: 120,
  },
  input: {
    color: "#fff",
    fontSize: 15,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#00AFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});