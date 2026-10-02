import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { API_URL } from "../constants/api";
type Mensagem = {
  id: number;
  texto: string;
  tipo: "texto" | "foto" | "audio";
  minha: boolean;
  hora: string;
};

type OutroUsuario = {
  id: number;
  nome: string;
  foto: string | null;
  online?: boolean;
};

function tipoDaMensagem(tipo: string): Mensagem["tipo"] {
  if (tipo === "foto") return "foto";
  if (tipo === "audio") return "audio";
  return "texto";
}

function formatarDuracao(segundos: number) {
  const total = Math.max(0, Math.floor(segundos));
  const min = Math.floor(total / 60);
  const seg = String(total % 60).padStart(2, "0");
  return `${min}:${seg}`;
}

// Bolha de áudio com play/pause e barra de progresso
function BolhaAudio({ uri, minha }: { uri: string; minha: boolean }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const duracao = status.duration || 0;
  const progresso = duracao > 0 ? Math.min(1, status.currentTime / duracao) : 0;

  function alternar() {
    if (status.playing) {
      player.pause();
      return;
    }
    // terminou? volta para o começo antes de tocar de novo
    if (duracao > 0 && status.currentTime >= duracao - 0.1) {
      player.seekTo(0);
    }
    player.play();
  }

  return (
    <View style={estilosAudio.linha}>
      <TouchableOpacity
        style={[estilosAudio.botao, minha ? estilosAudio.botaoMinha : estilosAudio.botaoOutra]}
        onPress={alternar}
        activeOpacity={0.8}
      >
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={20}
          color={minha ? "#fff" : "#000"}
        />
      </TouchableOpacity>

      <View style={estilosAudio.barraArea}>
        <View style={estilosAudio.barraFundo}>
          <View
            style={[
              estilosAudio.barraProgresso,
              { width: `${progresso * 100}%`, backgroundColor: minha ? "#fff" : "#00AFFF" },
            ]}
          />
        </View>
        <Text style={estilosAudio.tempo}>
          {formatarDuracao(status.playing || status.currentTime > 0 ? status.currentTime : duracao)}
        </Text>
      </View>
    </View>
  );
}

function urlFoto(caminho: string | null) {
  if (!caminho) return null;
  return `${API_URL}/${caminho.replace(/\\/g, "/")}`;
}

function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function Chat() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const outroUsuarioId = params.id;
  const anuncioId = params.anuncioId;

  const [meuUsuarioId, setMeuUsuarioId] = useState<number | null>(null);
  const [outroUsuario, setOutroUsuario] = useState<OutroUsuario | null>(null);
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoAudio, setEnviandoAudio] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);

  const gravador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const estadoGravador = useAudioRecorderState(gravador);
  const gravando = estadoGravador.isRecording;
  const flatListRef = useRef<FlatList>(null);

  function irParaUltimaMensagem(animated = true) {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  }

  useEffect(() => {
    async function carregarUsuarioLogado() {
      try {
        const id = await AsyncStorage.getItem("usuarioId");
        if (id) setMeuUsuarioId(Number(id));
      } catch (erro) {
        console.error("Erro ao carregar usuário logado:", erro);
      }
    }
    carregarUsuarioLogado();
  }, []);

  useEffect(() => {
    async function carregarOutroUsuario() {
      try {
        const resposta = await fetch(`${API_URL}/usuarios/${outroUsuarioId}`);
        const dados = await resposta.json();
        setOutroUsuario(dados.usuario);
      } catch (erro) {
        console.error("Erro ao carregar dados do contato:", erro);
      }
    }
    if (!outroUsuarioId) return;

    carregarOutroUsuario();
    // atualiza o "online / offline" do contato enquanto o chat está aberto
    const intervalo = setInterval(carregarOutroUsuario, 15000);
    return () => clearInterval(intervalo);
  }, [outroUsuarioId]);

  // Garante que o áudio recebido toque no alto-falante (e também no modo silencioso do iOS)
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!meuUsuarioId || !anuncioId || !outroUsuarioId) return;

    async function carregarMensagens() {
      try {
        const resposta = await fetch(
          `${API_URL}/mensagens/${anuncioId}/${meuUsuarioId}/${outroUsuarioId}`
        );

        if (!resposta.ok) {
          console.error("Erro ao buscar mensagens: status", resposta.status);
          return;
        }

        const dados = await resposta.json();

        const formatadas: Mensagem[] = dados.map((m: any) => ({
          id: m.id,
          texto: m.conteudo,
          tipo: tipoDaMensagem(m.tipo),
          minha: m.remetenteId === meuUsuarioId,
          hora: new Date(m.data_hora).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMensagens((mensagensAtuais) => {
          if (mensagensAtuais.length === formatadas.length) {
            return mensagensAtuais;
          }
          irParaUltimaMensagem(true);
          return formatadas;
        });
      } catch (erro) {
        console.error("Erro ao carregar mensagens:", erro);
      }
    }

    carregarMensagens();
    const interval = setInterval(() => carregarMensagens(), 5000);
    return () => clearInterval(interval);
  }, [meuUsuarioId, outroUsuarioId, anuncioId]);

  async function enviarMensagem() {
    if (!texto.trim()) {
      Alert.alert("Digite uma mensagem", "Escreva algo antes de enviar.");
      return;
    }

    if (!meuUsuarioId) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    if (!anuncioId || !outroUsuarioId) {
      Alert.alert("Erro", "Dados da conversa incompletos.");
      return;
    }

    const conteudo = texto.trim();
    setTexto("");

    try {
      const payload = {
        conteudo,
        tipo: "texto",
        remetenteId: meuUsuarioId,
        destinatarioId: Number(outroUsuarioId),
        anuncioId: Number(anuncioId),
      };

      const resposta = await fetch(`${API_URL}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const mensagemCriada = await resposta.json();

      if (!resposta.ok) {
        console.error("Erro ao enviar mensagem", resposta.status, mensagemCriada);
        Alert.alert("Erro ao enviar mensagem", mensagemCriada.erro || "Tente novamente mais tarde.");
        return;
      }

      const novaMensagem: Mensagem = {
        id: mensagemCriada.id,
        texto: mensagemCriada.conteudo,
        tipo: "texto",
        minha: true,
        hora: new Date(mensagemCriada.data_hora).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMensagens((mensagensAtuais) => [...mensagensAtuais, novaMensagem]);
      irParaUltimaMensagem(true);
    } catch (erro: any) {
      console.error("Erro ao enviar mensagem:", erro);
      Alert.alert("Erro", erro.message || "Não foi possível conectar ao servidor.");
    }
  }

  async function escolherEEnviarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar suas fotos para enviar uma imagem.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (resultado.canceled) return;

    if (!meuUsuarioId) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    if (!anuncioId) {
      Alert.alert("Erro", "Dados do anúncio ausentes.");
      return;
    }

    const foto = resultado.assets[0];

    try {
      setEnviandoFoto(true);

      const formData = new FormData();
      formData.append("remetenteId", String(meuUsuarioId));
      formData.append("destinatarioId", String(outroUsuarioId));
      formData.append("anuncioId", String(anuncioId));
      formData.append("foto", {
        uri: foto.uri,
        name: foto.fileName || "foto.jpg",
        type: "image/jpeg",
      } as any);

      const resposta = await fetch(`${API_URL}/mensagens/foto`, {
        method: "POST",
        body: formData,
      });

      const mensagemCriada = await resposta.json();

      if (!resposta.ok) {
        throw new Error(mensagemCriada.erro || "Erro ao enviar foto");
      }

      const novaMensagem: Mensagem = {
        id: mensagemCriada.id,
        texto: mensagemCriada.conteudo,
        tipo: "foto",
        minha: true,
        hora: new Date(mensagemCriada.data_hora).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMensagens((mensagensAtuais) => [...mensagensAtuais, novaMensagem]);
      irParaUltimaMensagem(true);
    } catch (erro) {
      console.error("Erro ao enviar foto:", erro);
      Alert.alert("Erro", "Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function iniciarGravacao() {
    if (!meuUsuarioId) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    try {
      const permissao = await AudioModule.requestRecordingPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert("Permissão necessária", "Precisamos acessar o microfone para gravar um áudio.");
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await gravador.prepareToRecordAsync();
      gravador.record();
    } catch (erro) {
      console.error("Erro ao iniciar gravação:", erro);
      Alert.alert("Erro", "Não foi possível iniciar a gravação.");
    }
  }

  async function voltarModoReproducao() {
    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    } catch {
      // sem problema: o modo é ajustado de novo na próxima gravação/reprodução
    }
  }

  async function cancelarGravacao() {
    try {
      await gravador.stop();
    } catch (erro) {
      console.error("Erro ao cancelar gravação:", erro);
    }
    await voltarModoReproducao();
  }

  async function enviarAudio() {
    if (!meuUsuarioId || !anuncioId || !outroUsuarioId) {
      Alert.alert("Erro", "Dados da conversa incompletos.");
      return;
    }

    const duracaoMs = estadoGravador.durationMillis;

    try {
      setEnviandoAudio(true);
      await gravador.stop();
      await voltarModoReproducao();

      const uri = gravador.uri;
      if (!uri) throw new Error("Gravação sem arquivo");

      // evita mandar toque acidental no botão
      if (duracaoMs < 1000) {
        Alert.alert("Áudio muito curto", "Segure um pouco mais para gravar a mensagem.");
        return;
      }

      const extensao = (uri.split(".").pop() || "m4a").toLowerCase();

      const formData = new FormData();
      formData.append("remetenteId", String(meuUsuarioId));
      formData.append("destinatarioId", String(outroUsuarioId));
      formData.append("anuncioId", String(anuncioId));
      formData.append("audio", {
        uri,
        name: `audio.${extensao}`,
        type: `audio/${extensao === "m4a" ? "mp4" : extensao}`,
      } as any);

      const resposta = await fetch(`${API_URL}/mensagens/audio`, {
        method: "POST",
        body: formData,
      });

      const mensagemCriada = await resposta.json();

      if (!resposta.ok) {
        throw new Error(mensagemCriada.erro || "Erro ao enviar áudio");
      }

      const novaMensagem: Mensagem = {
        id: mensagemCriada.id,
        texto: mensagemCriada.conteudo,
        tipo: "audio",
        minha: true,
        hora: new Date(mensagemCriada.data_hora).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMensagens((mensagensAtuais) => [...mensagensAtuais, novaMensagem]);
      irParaUltimaMensagem(true);
    } catch (erro) {
      console.error("Erro ao enviar áudio:", erro);
      Alert.alert("Erro", "Não foi possível enviar o áudio. Tente novamente.");
    } finally {
      setEnviandoAudio(false);
    }
  }

  function abrirPerfilDoContato() {
    if (!outroUsuarioId) return;
    router.push({
      pathname: "/perfilUsuario",
      params: { id: String(outroUsuarioId) },
    });
  }

  async function apagarConversa() {
    setMenuVisivel(false);
    Alert.alert(
      "Apagar conversa",
      "As mensagens desta conversa serão apagadas apenas para você. A outra pessoa continuará vendo a conversa. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await fetch(
                `${API_URL}/mensagens/${anuncioId}/${meuUsuarioId}/${outroUsuarioId}`,
                { method: "DELETE" }
              );
              if (!resposta.ok) throw new Error("Falha ao apagar");
              setMensagens([]);
            } catch (erro) {
              console.error("Erro ao apagar conversa:", erro);
              Alert.alert("Erro", "Não foi possível apagar a conversa.");
            }
          },
        },
      ]
    );
  }

  function irParaFinalizacao() {
    setMenuVisivel(false);
    router.push({
      pathname: "/FinalizandoTroca",
      params: {
        anuncioId: String(anuncioId),
        usuarioId: String(meuUsuarioId),
        outroUsuarioId: String(outroUsuarioId),
      },
    });
  }

  function renderMensagem({ item }: { item: Mensagem }) {
    return (
      <View
        style={[
          styles.mensagemContainer,
          item.minha ? styles.mensagemMinhaContainer : styles.mensagemOutraContainer,
        ]}
      >
        <View
          style={[
            styles.mensagem,
            item.minha ? styles.mensagemMinha : styles.mensagemOutra,
            item.tipo === "foto" && styles.mensagemFoto,
            item.tipo === "audio" && styles.mensagemAudio,
          ]}
        >
          {item.tipo === "foto" ? (
            <Image source={{ uri: urlFoto(item.texto)! }} style={styles.imagemMensagem} />
          ) : item.tipo === "audio" ? (
            <BolhaAudio uri={urlFoto(item.texto)!} minha={item.minha} />
          ) : (
            <Text style={styles.mensagemTexto}>{item.texto}</Text>
          )}
          <Text style={styles.hora}>{item.hora}</Text>
        </View>
      </View>
    );
  }

  const fotoContato = urlFoto(outroUsuario?.foto ?? null);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#00AFFF" />
          </TouchableOpacity>

          {/* Toque na foto ou no nome para abrir o perfil do contato */}
          <TouchableOpacity
            style={styles.areaPerfil}
            onPress={abrirPerfilDoContato}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              {fotoContato ? (
                <Image source={{ uri: fotoContato }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>
                    {outroUsuario?.nome ? iniciaisDe(outroUsuario.nome) : "?"}
                  </Text>
                </View>
              )}
              <View style={[styles.online, !outroUsuario?.online && styles.offline]} />
            </View>

            <View style={styles.infoUsuario}>
              <Text style={styles.nomeUsuario} numberOfLines={1}>
                {outroUsuario?.nome || "Carregando..."}
              </Text>
              <Text style={[styles.status, !outroUsuario?.online && styles.statusOffline]}>
                {outroUsuario?.online ? "online" : "offline"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisivel(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#00AFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.flatList}
          ref={flatListRef}
          data={mensagens}
          renderItem={renderMensagem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listaMensagens}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => irParaUltimaMensagem(false)}
        />

        {gravando || enviandoAudio ? (
          <View style={styles.inputArea}>
            <TouchableOpacity
              style={styles.anexo}
              onPress={cancelarGravacao}
              disabled={enviandoAudio}
            >
              <Ionicons name="trash-outline" size={25} color="#FF3B3B" />
            </TouchableOpacity>

            <View style={[styles.inputContainer, styles.gravandoContainer]}>
              <View style={styles.pontoGravando} />
              <Text style={styles.gravandoTexto}>
                {enviandoAudio
                  ? "Enviando áudio..."
                  : `Gravando  ${formatarDuracao(estadoGravador.durationMillis / 1000)}`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.enviar}
              onPress={enviarAudio}
              disabled={enviandoAudio}
            >
              <Ionicons name={enviandoAudio ? "hourglass-outline" : "send"} size={21} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.anexo} onPress={escolherEEnviarFoto} disabled={enviandoFoto}>
              <Ionicons
                name={enviandoFoto ? "hourglass-outline" : "add-circle-outline"}
                size={27}
                color="#00AFFF"
              />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite uma mensagem..."
                placeholderTextColor="#666"
                value={texto}
                onChangeText={setTexto}
                multiline
              />
            </View>

            {texto.trim().length > 0 ? (
              <TouchableOpacity style={styles.enviar} onPress={enviarMensagem}>
                <Ionicons name="send" size={21} color="#000" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.enviar} onPress={iniciarGravacao}>
                <Ionicons name="mic" size={23} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={menuVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisivel(false)}
      >
        <TouchableOpacity
          style={estilosMenu.fundo}
          activeOpacity={1}
          onPress={() => setMenuVisivel(false)}
        >
          <View style={estilosMenu.caixa}>
            <TouchableOpacity style={estilosMenu.opcao} onPress={irParaFinalizacao}>
              <Ionicons name="checkmark-done-outline" size={20} color="#00AFFF" />
              <Text style={estilosMenu.textoOpcao}>Finalizar troca</Text>
            </TouchableOpacity>

            <View style={estilosMenu.divisor} />

            <TouchableOpacity style={estilosMenu.opcao} onPress={apagarConversa}>
              <Ionicons name="trash-outline" size={20} color="#FF3B3B" />
              <Text style={[estilosMenu.textoOpcao, { color: "#FF3B3B" }]}>Apagar mensagens</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  inner: { flex: 1, backgroundColor: "#0B0B0B" },
  header: {
    height: 65,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1324",
    borderBottomWidth: 1,
    borderBottomColor: "#161D2E",
  },
  botaoVoltar: { width: 40, height: 40, justifyContent: "center", alignItems: "center", marginRight: 5 },
  avatarContainer: { width: 45, height: 45, position: "relative" },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTexto: { color: "#00AFFF", fontSize: 15, fontWeight: "bold" },
  online: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#00FF44",
    right: -1,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#0D1324",
  },
  areaPerfil: { flex: 1, flexDirection: "row", alignItems: "center" },
  offline: { backgroundColor: "#6B7280" },
  statusOffline: { color: "#9CA3AF" },
  infoUsuario: { flex: 1, marginLeft: 12 },
  nomeUsuario: { color: "#fff", fontSize: 17, fontWeight: "700" },
  status: { color: "#00AFFF", fontSize: 13, marginTop: 2 },
  menuButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  flatList: { flex: 1 },
  listaMensagens: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 12, flexGrow: 1, justifyContent: "flex-end" },
  mensagemContainer: { width: "100%", marginBottom: 10 },
  mensagemMinhaContainer: { alignItems: "flex-end" },
  mensagemOutraContainer: { alignItems: "flex-start" },
  mensagem: { maxWidth: "78%", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 18 },
  mensagemFoto: { padding: 6 },
  mensagemAudio: { paddingVertical: 8, minWidth: 210 },
  gravandoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  pontoGravando: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B3B" },
  gravandoTexto: { color: "#fff", fontSize: 15 },
  mensagemMinha: { backgroundColor: "#00AFFF", borderBottomRightRadius: 5 },
  mensagemOutra: { backgroundColor: "#141C2E", borderBottomLeftRadius: 5 },
  mensagemTexto: { color: "#fff", fontSize: 15, lineHeight: 21 },
  imagemMensagem: { width: 200, height: 200, borderRadius: 12 },
  hora: { color: "#B8C0CC", fontSize: 10, marginTop: 5, textAlign: "right" },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0D1324",
    borderTopWidth: 1,
    borderTopColor: "#161D2E",
  },
  anexo: { width: 40, height: 48, justifyContent: "center", alignItems: "center" },
  inputContainer: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: "#141C2E",
    borderRadius: 24,
    paddingHorizontal: 17,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#202B42",
  },
  input: { color: "#fff", fontSize: 15, paddingTop: 12, paddingBottom: 12 },
  enviar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00AFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

const estilosAudio = StyleSheet.create({
  linha: { flexDirection: "row", alignItems: "center", gap: 10 },
  botao: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  botaoMinha: { backgroundColor: "rgba(0,0,0,0.25)" },
  botaoOutra: { backgroundColor: "#00AFFF" },
  barraArea: { flex: 1 },
  barraFundo: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  barraProgresso: { height: 4, borderRadius: 2 },
  tempo: { color: "#B8C0CC", fontSize: 11, marginTop: 5 },
});

const estilosMenu = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 15,
  },
  caixa: {
    backgroundColor: "#141C2E",
    borderRadius: 12,
    width: 200,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#202B42",
  },
  opcao: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 16 },
  textoOpcao: { color: "#fff", fontSize: 14, fontWeight: "600" },
  divisor: { height: 1, backgroundColor: "#202B42" },
});