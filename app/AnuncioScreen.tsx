import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/HeaderEscolha";

// TODO: mover para um arquivo compartilhado (ex: data/anuncios.ts) e importar
// tanto aqui quanto na tela de listagem, evitando duplicar os dados mockados.
type Anuncio = {
  id: string;
  nome: string;
  verificado: boolean;
  servico: string;
  descricao: string;
  avaliacoes: number;
  entrega: string;
  local: string;
  preco: string;
  categoria: string;
};

const ANUNCIOS: Anuncio[] = [
  {
    id: "1",
    nome: "João Silva",
    verificado: true,
    servico: "Criação de Sites Profissionais",
    descricao:
      "Desenvolvo sites institucionais e landing pages responsivas, com foco em performance e design moderno.",
    avaliacoes: 32,
    entrega: "2 dias",
    local: "São Paulo - SP",
    preco: "R$ 150,00",
    categoria: "Programação",
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    verificado: true,
    servico: "Design de Logotipo e Identidade Visual",
    descricao:
      "Crio identidades visuais completas: logotipo, paleta de cores, tipografia e manual de marca.",
    avaliacoes: 58,
    entrega: "3 dias",
    local: "Rio de Janeiro - RJ",
    preco: "R$ 200,00",
    categoria: "Design",
  },
  {
    id: "3",
    nome: "Carlos Souza",
    verificado: false,
    servico: "Desenvolvimento de App React Native",
    descricao:
      "Desenvolvo aplicativos mobile multiplataforma com React Native e integração com APIs.",
    avaliacoes: 12,
    entrega: "7 dias",
    local: "Curitiba - PR",
    preco: "R$ 800,00",
    categoria: "Programação",
  },
  {
    id: "4",
    nome: "Ana Costa",
    verificado: true,
    servico: "Edição de Vídeos para Redes Sociais",
    descricao:
      "Edição dinâmica de vídeos para Reels, TikTok e Shorts, com cortes, legendas e efeitos.",
    avaliacoes: 45,
    entrega: "1 dia",
    local: "Belo Horizonte - MG",
    preco: "R$ 90,00",
    categoria: "Vídeo",
  },
];

// Mock dos serviços do próprio usuário logado, que podem ser oferecidos em troca.
// TODO: substituir por dados reais vindos da API/perfil do usuário.
const MEUS_SERVICOS = [
  { id: "m1", nome: "Edição de Vídeos Curtos" },
  { id: "m2", nome: "Criação de Posts para Instagram" },
  { id: "m3", nome: "Aulas de Inglês Online" },
];

export default function DetalheAnuncio() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const anuncio = ANUNCIOS.find((a) => a.id === id);

  const [servicoEscolhido, setServicoEscolhido] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  if (!anuncio) {
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

  function enviarProposta() {
    if (!servicoEscolhido) {
      Alert.alert("Escolha um serviço", "Selecione qual serviço você quer oferecer em troca.");
      return;
    }

    const nomeServico = MEUS_SERVICOS.find((s) => s.id === servicoEscolhido)?.nome;

    Alert.alert(
      "Proposta enviada",
      `Você propôs trocar "${nomeServico}" pelo serviço "${anuncio.servico}" de ${anuncio.nome}.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header></Header>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Card do anunciante */}
        <View style={styles.card}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {anuncio.nome} {anuncio.verificado && "✓"}
            </Text>
            <Text style={styles.rating}>★★★★★ ({anuncio.avaliacoes} avaliações)</Text>
            <Text style={styles.info}>{anuncio.local}</Text>
          </View>
        </View>

        {/* Detalhes do serviço */}
        <Text style={styles.servicoTitulo}>{anuncio.servico}</Text>

        <View style={styles.tagsLinha}>
          <View style={styles.tagInfo}>
            <Ionicons name="pricetag-outline" size={14} color="#27A7FF" />
            <Text style={styles.tagInfoTexto}>{anuncio.categoria}</Text>
          </View>
          <View style={styles.tagInfo}>
            <Ionicons name="time-outline" size={14} color="#27A7FF" />
            <Text style={styles.tagInfoTexto}>Entrega em {anuncio.entrega}</Text>
          </View>
        </View>

        <Text style={styles.descricao}>{anuncio.descricao}</Text>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Valor de referência</Text>
          <Text style={styles.price}>{anuncio.preco}</Text>
        </View>

        {/* Proposta de troca */}
        <View style={styles.separador} />

        <Text style={styles.secaoTitulo}>Propor troca de serviço</Text>
        <Text style={styles.secaoSubtitulo}>
          Escolha qual dos seus serviços você quer oferecer em troca deste anúncio.
        </Text>

        {MEUS_SERVICOS.map((servico) => {
          const selecionado = servico.id === servicoEscolhido;
          return (
            <TouchableOpacity
              key={servico.id}
              style={[styles.opcaoServico, selecionado && styles.opcaoServicoAtiva]}
              onPress={() => setServicoEscolhido(servico.id)}
            >
              <Ionicons
                name={selecionado ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selecionado ? "#27A7FF" : "#888"}
              />
              <Text style={[styles.opcaoServicoTexto, selecionado && styles.opcaoServicoTextoAtivo]}>
                {servico.nome}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.label}>Mensagem (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Explique por que sua troca é uma boa proposta..."
          placeholderTextColor="#888"
          value={mensagem}
          onChangeText={setMensagem}
        />

        <TouchableOpacity style={styles.button} onPress={enviarProposta}>
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={styles.buttonText}>ENVIAR PROPOSTA DE TROCA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  header: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  backButtonText: {
    color: "#fff",
    fontSize: 16,
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

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    marginRight: 15,
  },

  userName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  rating: {
    color: "#FFD700",
    marginTop: 5,
  },

  info: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  servicoTitulo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },

  tagsLinha: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },

  tagInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  tagInfoTexto: {
    color: "#27A7FF",
    fontSize: 13,
  },

  descricao: {
    color: "#9CA3AF",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  priceBox: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  priceLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 4,
  },

  price: {
    color: "#27A7FF",
    fontSize: 22,
    fontWeight: "bold",
  },

  separador: {
    height: 1,
    backgroundColor: "#1F3C5E",
    marginVertical: 25,
  },

  secaoTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },

  secaoSubtitulo: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 18,
  },

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

  opcaoServicoAtiva: {
    borderColor: "#27A7FF",
  },

  opcaoServicoTexto: {
    color: "#9CA3AF",
    fontSize: 15,
  },

  opcaoServicoTextoAtivo: {
    color: "#fff",
    fontWeight: "600",
  },

  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 20,
  },

  input: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

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

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  vazioContainer: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
  },

  vazioTexto: {
    color: "#666",
    fontSize: 16,
  },
});