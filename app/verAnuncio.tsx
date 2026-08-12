import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/HeaderEscolha";
import { router } from "expo-router";

type Anuncio = {
  id: string;
  nome: string;
  verificado: boolean;
  servico: string;
  avaliacoes: number;
  entrega: string;
  local: string;
  categoria: string;
};

const ANUNCIOS: Anuncio[] = [
  {
    id: "1",
    nome: "João Silva",
    verificado: true,
    servico: "Criação de Sites Profissionais",
    avaliacoes: 32,
    entrega: "2 dias",
    local: "São Paulo - SP",
    categoria: "Programação",
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    verificado: true,
    servico: "Design de Logotipo e Identidade Visual",
    avaliacoes: 58,
    entrega: "3 dias",
    local: "Rio de Janeiro - RJ",
    categoria: "Design",
  },
  {
    id: "3",
    nome: "Carlos Souza",
    verificado: false,
    servico: "Desenvolvimento de App React Native",
    avaliacoes: 12,
    entrega: "7 dias",
    local: "Curitiba - PR",
    categoria: "Programação",
  },
  {
    id: "4",
    nome: "Ana Costa",
    verificado: true,
    servico: "Edição de Vídeos para Redes Sociais",
    avaliacoes: 45,
    entrega: "1 dia",
    local: "Belo Horizonte - MG",
    categoria: "Vídeo",
  },
];

const CATEGORIAS = ["Todos", "Programação", "Design", "Vídeo", "Marketing"];

export default function AnunciosDisponiveis() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");

  const anunciosFiltrados = ANUNCIOS.filter((a) => {
    const bateCategoria = categoriaAtiva === "Todos" || a.categoria === categoriaAtiva;
    const bateBusca = a.servico.toLowerCase().includes(busca.toLowerCase()) ||
      a.nome.toLowerCase().includes(busca.toLowerCase());
    return bateCategoria && bateBusca;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header></Header>
      </View>

      <FlatList
        data={anunciosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Serviços disponíveis</Text>
              <Text style={styles.subtitle}>
                Encontre profissionais para o que você precisa.
              </Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar serviço ou profissional..."
                placeholderTextColor="#888"
                value={busca}
                onChangeText={setBusca}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriasScroll}
              contentContainerStyle={styles.categoriasContainer}
            >
              {CATEGORIAS.map((cat) => {
                const ativa = cat === categoriaAtiva;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoriaTag, ativa && styles.categoriaTagAtiva]}
                    onPress={() => setCategoriaAtiva(cat)}
                  >
                    <Text style={[styles.categoriaTagText, ativa && styles.categoriaTagTextAtiva]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.resultados}>
              {anunciosFiltrados.length} serviço(s) encontrado(s)
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}  onPress={() => router.push({ pathname: "/AnuncioScreen", params: { id: item.id } })}>
            <View style={styles.avatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {item.nome} {item.verificado && "✓"}
              </Text>

              <Text style={styles.serviceTitle}>{item.servico}</Text>

              <Text style={styles.rating}>★★★★★ ({item.avaliacoes} avaliações)</Text>

              <Text style={styles.info}>
                Entrega em {item.entrega} • {item.local}
              </Text>

            </View>

            <View style={styles.priceBox}>
              <Text style={styles.price}>Ver</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.vazioContainer}>
            <Ionicons name="search-outline" size={40} color="#444" />
            <Text style={styles.vazioTexto}>Nenhum serviço encontrado</Text>
          </View>
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      />
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

  titleContainer: {
    alignItems: "center",
    marginVertical: 30,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },

  categoriasScroll: {
    marginTop: 20,
  },

  categoriasContainer: {
    gap: 10,
    paddingRight: 20,
  },

  categoriaTag: {
    borderWidth: 1,
    borderColor: "#00AFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  categoriaTagAtiva: {
    backgroundColor: "#00AFFF",
  },

  categoriaTagText: {
    color: "#00AFFF",
  },

  categoriaTagTextAtiva: {
    color: "#fff",
    fontWeight: "bold",
  },

  resultados: {
    color: "#9CA3AF",
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    marginRight: 15,
  },

  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  serviceTitle: {
    color: "#00AFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },

  rating: {
    color: "#FFD700",
    marginTop: 5,
  },

  info: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  priceBox: {
    backgroundColor: "#00AFFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  price: {
    color: "#fff",
    fontWeight: "bold",
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