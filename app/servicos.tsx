import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const TODOS_SERVICOS = [
  {
    id: "1",
    titulo: "Criação de Sites",
    categoria: "Design",
    preco: "R$ 150,00",
    nota: "5.0",
    cidade: "São Paulo - SP",
    imagem:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
  {
    id: "2",
    titulo: "Desenvolvimento Web",
    categoria: "Programação",
    preco: "R$ 200,00",
    nota: "4.9",
    cidade: "Rio de Janeiro - RJ",
    imagem:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  },
  {
    id: "3",
    titulo: "Aulas de Matemática",
    categoria: "Aulas",
    preco: "R$ 80,00",
    nota: "5.0",
    cidade: "São Paulo - SP",
    imagem:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a",
  },
  {
    id: "4",
    titulo: "Edição de Vídeo",
    categoria: "Design",
    preco: "R$ 120,00",
    nota: "4.8",
    cidade: "Curitiba - PR",
    imagem:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
  },
  {
    id: "5",
    titulo: "Aulas de Inglês",
    categoria: "Aulas",
    preco: "R$ 90,00",
    nota: "4.9",
    cidade: "Belo Horizonte - MG",
    imagem:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
  {
    id: "6",
    titulo: "Manutenção de Computadores",
    categoria: "Programação",
    preco: "R$ 70,00",
    nota: "4.7",
    cidade: "São Paulo - SP",
    imagem:
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
];

const CATEGORIAS = ["Todos", "Design", "Programação", "Aulas"];

export default function Servicos() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const servicosFiltrados = TODOS_SERVICOS.filter((item) => {
    const combinaCategoria =
      categoria === "Todos" || item.categoria === categoria;

    const combinaBusca = item.titulo
      .toLowerCase()
      .includes(busca.toLowerCase());

    return combinaCategoria && combinaBusca;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#00AFFF" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Explorar Serviços</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#999" />

        <TextInput
          placeholder="Buscar serviços..."
          placeholderTextColor="#999"
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Categorias */}
      <FlatList
        horizontal
        data={CATEGORIAS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriasContainer}
        contentContainerStyle={styles.categoriasContent}
        renderItem={({ item }) => {
          const ativo = categoria === item;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCategoria(item)}
              style={[
                styles.chip,
                ativo && styles.chipAtivo,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  ativo && styles.chipTextAtivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Lista */}
      <FlatList
        data={servicosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum serviço encontrado.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
          >
            <Image
              source={{ uri: item.imagem }}
              style={styles.imagem}
            />

            <View style={styles.info}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {item.categoria}
                </Text>
              </View>

              <Text style={styles.cardTitulo}>
                {item.titulo}
              </Text>

              <Text style={styles.rating}>
                ⭐ {item.nota}
              </Text>

              <Text style={styles.preco}>
                {item.preco}
              </Text>

              <Text style={styles.local}>
                📍 {item.cidade}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B18",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1324",
    marginHorizontal: 20,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1A2338",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 15,
  },

  /* ===== Categorias ===== */

  categoriasContainer: {
    marginTop: 18,
    maxHeight: 75,
  },

  categoriasContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  chip: {
    minWidth: 105,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    marginHorizontal: 6,
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 18,
  },

  chipAtivo: {
    backgroundColor: "#00AFFF",
    borderColor: "#00AFFF",
  },

  chipText: {
    color: "#B5B5B5",
    fontSize: 14,
    fontWeight: "600",
  },

  chipTextAtivo: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* ===== Lista ===== */

  lista: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },

  vazio: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#0D1324",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#18233A",
  },

  imagem: {
    width: 115,
    height: 115,
  },

  info: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#00AFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },

  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  cardTitulo: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  rating: {
    color: "#C8C8C8",
    marginTop: 5,
    fontSize: 13,
  },

  preco: {
    color: "#00AFFF",
    marginTop: 5,
    fontSize: 17,
    fontWeight: "bold",
  },

  local: {
    color: "#8D96A8",
    marginTop: 5,
    fontSize: 13,
  },
});