import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/HeaderEscolha";

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

function urlFoto(caminho: string | null) {
  if (!caminho) return null;
  return `${API_URL}/${caminho.replace(/\\/g, "/")}`;
}

// Lê o token e o id do usuário do AsyncStorage tentando várias chaves possíveis,
// já que telas de login diferentes costumam salvar com nomes diferentes
// (ex: "token" vs "userToken", "usuarioId" vs "userId" vs "id").
async function lerSessao() {
  const chavesToken = ["token", "userToken", "accessToken", "authToken"];
  const chavesUsuarioId = ["usuarioId", "userId", "id", "usuario_id"];

  let token: string | null = null;
  for (const chave of chavesToken) {
    const valor = await AsyncStorage.getItem(chave);
    if (valor) {
      token = valor;
      break;
    }
  }

  let usuarioId: string | null = null;
  for (const chave of chavesUsuarioId) {
    const valor = await AsyncStorage.getItem(chave);
    if (valor) {
      usuarioId = valor;
      break;
    }
  }

  // Fallback: alguns logins salvam um objeto "usuario" inteiro em JSON.
  if (!usuarioId) {
    const usuarioJson = await AsyncStorage.getItem("usuario") || await AsyncStorage.getItem("usuarioLogado");
    if (usuarioJson) {
      try {
        const usuarioObj = JSON.parse(usuarioJson);
        if (usuarioObj?.id) usuarioId = String(usuarioObj.id);
      } catch (e) {
        // ignora se não for JSON válido
      }
    }
  }

  if (__DEV__) {
    console.log("[lerSessao] token:", token, "| usuarioId:", usuarioId);
  }

  return { token, usuarioId };
}

export default function DetalheAnuncio() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [servicoOferecido, setServicoOferecido] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function buscarAnuncio() {
        if (!id) return;
        try {
          setCarregando(true);
          setErro(false);

          const resposta = await fetch(`${API_URL}/anuncios/${id}`);
          const dados = await resposta.json();

          if (resposta.ok) {
            setAnuncio(dados.anuncio);
          } else {
            console.log(dados.erro);
            setErro(true);
          }
        } catch (e) {
          console.log(e);
          setErro(true);
        } finally {
          setCarregando(false);
        }
      }

      buscarAnuncio();
    }, [id])
  );

  async function enviarProposta() {
    if (!servicoOferecido.trim()) {
      Alert.alert("Informe um serviço", "Escreva qual serviço você quer oferecer em troca.");
      return;
    }
    if (!anuncio) return;

    const { token, usuarioId: solicitanteId } = await lerSessao();

    if (!token || !solicitanteId) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      router.replace("/login");
      return;
    }

    if (Number(solicitanteId) === anuncio.usuarioId) {
      Alert.alert("Não permitido", "Você não pode enviar uma proposta para o seu próprio anúncio.");
      return;
    }

    const nomeServico = servicoOferecido.trim();

    try {
      setEnviando(true);

      const resposta = await fetch(`${API_URL}/anuncios/${anuncio.id}/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          servicoOferecido: nomeServico,
          mensagem: mensagem.trim(),
        }),
      });

      let dados: any = null;
      try {
        dados = await resposta.json();
      } catch (e) {
        // resposta pode não ser JSON
      }

      if (!resposta.ok) {
        const erroMsg = dados?.erro || dados?.mensagem || `Erro ${resposta.status}`;
        console.log("[enviarProposta] resposta não ok:", resposta.status, dados);
        throw new Error(erroMsg || "Não foi possível enviar a proposta.");
      }

      Alert.alert(
        "Proposta enviada",
        `Você propôs trocar "${nomeServico}" pelo serviço "${anuncio.titulo}" de ${anuncio.usuario.nome}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (erro: any) {
      Alert.alert("Erro", erro.message || "Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header></Header>
        </View>
        <View style={styles.vazioContainer}>
          <ActivityIndicator color="#27A7FF" size="large" />
          <Text style={styles.vazioTexto}>Carregando anúncio...</Text>
        </View>
      </View>
    );
  }

  if (erro || !anuncio) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header></Header>
        </View>
        <View style={styles.vazioContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#444" />
          <Text style={styles.vazioTexto}>Anúncio não encontrado</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: "#27A7FF" }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const fotoAnuncio = urlFoto(anuncio.foto);
  const fotoUsuario = urlFoto(anuncio.usuario.foto);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header></Header>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {fotoAnuncio && (
          <Image source={{ uri: fotoAnuncio }} style={styles.imagemAnuncio} />
        )}

        <View style={styles.card}>
          {fotoUsuario ? (
            <Image source={{ uri: fotoUsuario }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{anuncio.usuario.nome}</Text>
            {(anuncio.cidade || anuncio.estado) && (
              <Text style={styles.info}>
                {anuncio.cidade}
                {anuncio.cidade && anuncio.estado ? " - " : ""}
                {anuncio.estado}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.servicoTitulo}>{anuncio.titulo}</Text>

        <View style={styles.tagsLinha}>
          <View style={styles.tagInfo}>
            <Ionicons name="pricetag-outline" size={14} color="#27A7FF" />
            <Text style={styles.tagInfoTexto}>{anuncio.categoria.nome}</Text>
          </View>
          {anuncio.disponibilidade && (
            <View style={styles.tagInfo}>
              <Ionicons name="time-outline" size={14} color="#27A7FF" />
              <Text style={styles.tagInfoTexto}>{anuncio.disponibilidade}</Text>
            </View>
          )}
        </View>

        <Text style={styles.descricao}>{anuncio.descricao}</Text>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Preferência de Troca</Text>
          <Text style={styles.price}>{anuncio.preferencia}</Text>
        </View>

        <View style={styles.separador} />

        <Text style={styles.secaoTitulo}>Propor troca de serviço</Text>
        <Text style={styles.secaoSubtitulo}>
          Escreva qual serviço você quer oferecer em troca deste anúncio.
        </Text>

        <Text style={styles.label}>Serviço oferecido</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Edição de vídeos curtos"
          placeholderTextColor="#888"
          value={servicoOferecido}
          onChangeText={setServicoOferecido}
          editable={!enviando}
        />

        <Text style={styles.label}>Mensagem (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Explique por que sua troca é uma boa proposta..."
          placeholderTextColor="#888"
          value={mensagem}
          onChangeText={setMensagem}
          editable={!enviando}
        />

        <TouchableOpacity style={styles.button} onPress={enviarProposta} disabled={enviando}>
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
              <Text style={styles.buttonText}>ENVIAR PROPOSTA DE TROCA</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  header: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imagemAnuncio: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: "#161D2E",
  },
  card: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#333", marginRight: 15 },
  userName: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  info: { color: "#9CA3AF", marginTop: 5 },
  servicoTitulo: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  tagsLinha: { flexDirection: "row", gap: 15, marginBottom: 15 },
  tagInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
  tagInfoTexto: { color: "#27A7FF", fontSize: 13 },
  descricao: { color: "#9CA3AF", fontSize: 15, lineHeight: 22, marginBottom: 20 },
  priceBox: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  priceLabel: { color: "#9CA3AF", fontSize: 13, marginBottom: 4 },
  price: { color: "#27A7FF", fontSize: 22, fontWeight: "bold" },
  separador: { height: 1, backgroundColor: "#1F3C5E", marginVertical: 25 },
  secaoTitulo: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  secaoSubtitulo: { color: "#9CA3AF", fontSize: 14, marginBottom: 18 },
  opcaoServico: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  opcaoServicoAtiva: { borderColor: "#27A7FF" },
  opcaoServicoTexto: { color: "#9CA3AF", fontSize: 15 },
  opcaoServicoTextoAtivo: { color: "#fff", fontWeight: "600" },
  label: { color: "#fff", fontSize: 16, marginBottom: 8, marginTop: 20 },
  input: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: "#27A7FF",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    gap: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  vazioContainer: { alignItems: "center", marginTop: 60, gap: 10 },
  vazioTexto: { color: "#666", fontSize: 16 },
});