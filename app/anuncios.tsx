import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Hearder";

const API_URL = "http://172.30.1.25:3000";

export default function Home() {
  const { name: nomeInicial } = useLocalSearchParams();
  const [name, setName] = useState(nomeInicial);
  const [foto, setFoto] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function atualizarUsuario() {
        try {
          // Primeiro pega o que já está salvo localmente (resposta rápida)
          const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");
          if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            setName(usuario.nome);
            if (usuario.foto) {
              setFoto(`${API_URL}/${usuario.foto.replace(/\\/g, "/")}`);
            } else {
              setFoto(null);
            }
          }

          // Depois busca no backend pra garantir que foto/nome removidos ou
          // atualizados no Perfil apareçam certinho aqui
          const id = await AsyncStorage.getItem("usuarioId");
          if (!id) return;

          const resposta = await fetch(`${API_URL}/usuarios/${id}`);
          const dados = await resposta.json();

          if (resposta.ok) {
            setName(dados.usuario.nome);
            setFoto(
              dados.usuario.foto
                ? `${API_URL}/${dados.usuario.foto.replace(/\\/g, "/")}`
                : null
            );

            // Mantém o AsyncStorage sincronizado com o que veio do backend
            await AsyncStorage.setItem(
              "usuarioLogado",
              JSON.stringify(dados.usuario)
            );
          }
        } catch (erro) {
          console.log(erro);
        }
      }

      atualizarUsuario();
    }, [])
  );

  // Como essa tela é a raiz da pilha (depois do login/cadastro), o botão
  // "voltar" do Android sairia do app direto. Aqui a gente pede confirmação
  // em vez de fechar sem avisar.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Sair do app", "Deseja sair do aplicativo?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: () => BackHandler.exitApp() },
        ]);
        return true; // bloqueia o comportamento padrão (sair sem avisar)
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const servicos = [
    {
      titulo: "Criação de Sites",
      categoria: "DESIGN",
      nota: "5.0",
      cidade: "São Paulo - SP",
      imagem: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    },
    {
      titulo: "Desenvolvimento Web",
      categoria: "PROGRAMAÇÃO",
      nota: "4.9",
      cidade: "Rio de Janeiro - RJ",
      imagem: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    },
    {
      titulo: "Aulas de Matemática",
      categoria: "AULAS",
      nota: "5.0",
      cidade: "São Paulo - SP",
      imagem: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    },
  ];

  const historicoRecente = [
    { nome: "Criação de Logo", valor: "R$ 100,00" },
    { nome: "Correção de Bug", valor: "R$ 80,00" },
    { nome: "Aulas de Física", valor: "R$ 70,00" },
  ];

  const servicosFiltrados = servicos.filter((item) =>
    (item.titulo + item.categoria).toLowerCase().includes(busca.toLowerCase())
  );

  function alternarFavorito(titulo: string) {
    setFavoritos((prev: string[]) =>
      prev.includes(titulo)
        ? prev.filter((t: string) => t !== titulo)
        : [...prev, titulo]
    );
  }

  function abrirFiltros() {
    Alert.alert("Filtrar por categoria", "Escolha uma categoria", [
      { text: "Todas", onPress: () => setBusca("") },
      { text: "Design", onPress: () => setBusca("design") },
      { text: "Programação", onPress: () => setBusca("programação") },
      { text: "Aulas", onPress: () => setBusca("aulas") },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  // Iniciais pra usar como fallback quando não há foto de perfil
  const iniciais = (name || "")
    .toString()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Header></Header>
        </View>

        {/* BOAS VINDAS */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeText}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              Olá, {name}
            </Text>
            <Text style={styles.subtitle}>
              Bem-vindo de volta! Encontre serviços incríveis ou ofereça sua
              ajuda.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => router.push("/perfil")}
          >
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {iniciais || "?"}
                </Text>
              </View>
            )}
            <View style={styles.online} />
          </TouchableOpacity>
        </View>

        {/* PESQUISA */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={24} color="#999" />
            <TextInput
              placeholder="Buscar serviços..."
              placeholderTextColor="#999"
              style={styles.input}
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={abrirFiltros}>
            <Ionicons name="filter-outline" size={24} color="#fff" />
            <Text style={styles.filterText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* AÇÕES */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push("/verAnuncio")}
          >
            <View style={[styles.circle, { backgroundColor: "#00AFFF" }]}>
              <Ionicons name="briefcase-outline" size={26} color="#000" />
            </View>
            <Text style={styles.actionTitle}>Serviços{"\n"}Ativos</Text>
            <Text style={styles.actionSubtitle}>Ver todos seus serviços</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push("/historicoServico")}
          >
            <View style={[styles.circle, { backgroundColor: "#9B4DFF" }]}>
              <Ionicons name="checkmark-done-outline" size={26} color="#000" />
            </View>
            <Text style={styles.actionTitle}>Serviços{"\n"}Realizados</Text>
            <Text style={styles.actionSubtitle}>Todos os serviços realizados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push("/oferecerServicos")}
          >
            <View style={[styles.circle, { backgroundColor: "#00FF44" }]}>
              <Ionicons name="star-outline" size={26} color="#000" />
            </View>
            <Text style={styles.actionTitle}>Usuário{"\n"}Favorito</Text>
            <Text style={styles.actionSubtitle}>Ver todos os Melhores Usuarios</Text>
          </TouchableOpacity>
        </View>

        {/* SERVIÇOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            Serviços em destaque
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/verAnuncio")}
          >
            <Text style={styles.link}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {servicosFiltrados.map((item, index) => {
            const favoritado = favoritos.includes(item.titulo);
            return (
              <View key={index} style={styles.serviceCard}>
                <Image source={{ uri: item.imagem }} style={styles.serviceImage} />

                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.categoria}</Text>
                </View>

                <TouchableOpacity
                  style={styles.favorite}
                  onPress={() => alternarFavorito(item.titulo)}
                >
                  <Ionicons
                    name={favoritado ? "heart" : "heart-outline"}
                    size={24}
                    color={favoritado ? "#FF3B6F" : "#fff"}
                  />
                </TouchableOpacity>

                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{item.titulo}</Text>
                  <Text style={styles.rating}>⭐ {item.nota}</Text>
                  <Text style={styles.location}>📍 {item.cidade}</Text>
                </View>
              </View>
            );
          })}

          {servicosFiltrados.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color="#444" />
              <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
            </View>
          )}
        </ScrollView>

        {/* HISTÓRICO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            Seu histórico recente
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/historicoServico")}
          >
            <Text style={styles.link}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          {historicoRecente.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.historyItem,
                index === historicoRecente.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
              onPress={() => router.push("/historicoServico")}
            >
              <View style={styles.historyLeft}>
                <Ionicons name="checkmark-circle" size={28} color="#00FF44" />
                <View>
                  <Text style={styles.historyTitle}>{item.nome}</Text>
                  <Text style={styles.historySubtitle}>Serviço concluído</Text>
                </View>
              </View>

              <Text style={styles.historyPrice}>{item.valor}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Ionicons name="home" size={30} color="#00AFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/verAnuncio")}>
          <Ionicons name="search" size={30} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/oferecerServicos")}
        >
          <Ionicons name="add" size={36} color="#00AFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Chat")}>
          <Ionicons name="chatbubble-outline" size={30} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/perfil")}>
          <Ionicons name="person-outline" size={30} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingTop: 50,
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00AFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  welcomeText: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#999",
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#00AFFF",
    fontSize: 26,
    fontWeight: "700",
  },
  online: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00FF44",
    position: "absolute",
    bottom: 4,
    right: 2,
    borderWidth: 2,
    borderColor: "#050B18",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 15,
    paddingHorizontal: 15,
    alignItems: "center",
    flexDirection: "row",
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
  },
  filterButton: {
    width: 120,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  filterText: {
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
  },
  actionCard: {
    width: "31%",
    backgroundColor: "#0D1324",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 15,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  actionSubtitle: {
    color: "#888",
    marginTop: 8,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 12,
  },
  linkButton: {
    paddingLeft: 12,
  },
  link: {
    color: "#00AFFF",
    fontSize: 18,
  },
  serviceCard: {
    width: 260,
    marginLeft: 20,
    backgroundColor: "#0D1324",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  serviceImage: {
    width: "100%",
    height: 170,
  },
  tag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#00AFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    color: "#fff",
    fontWeight: "bold",
  },
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
    padding: 6,
  },
  serviceInfo: {
    padding: 15,
  },
  serviceTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  rating: {
    color: "#fff",
    marginTop: 10,
  },
  price: {
    color: "#00AFFF",
    fontSize: 24,
    marginTop: 10,
    fontWeight: "bold",
  },
  location: {
    color: "#888",
    marginTop: 10,
  },
  emptyState: {
    width: 260,
    marginLeft: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#555",
    marginTop: 10,
  },
  historyCard: {
    backgroundColor: "#0D1324",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyTitle: {
    color: "#fff",
    fontSize: 18,
  },
  historySubtitle: {
    color: "#888",
    marginTop: 5,
  },
  historyPrice: {
    color: "#00AFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 80,
    backgroundColor: "#0D1324",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  addButton: {
    marginTop: -20,
  },
});