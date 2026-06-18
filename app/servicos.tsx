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
    imagem: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
  {
    id: "2",
    titulo: "Desenvolvimento Web",
    categoria: "Programação",
    preco: "R$ 200,00",
    nota: "4.9",
    cidade: "Rio de Janeiro - RJ",
    imagem: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  },
  {
    id: "3",
    titulo: "Aulas de Matemática",
    categoria: "Aulas",
    preco: "R$ 80,00",
    nota: "5.0",
    cidade: "São Paulo - SP",
    imagem: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
  },
  {
    id: "4",
    titulo: "Edição de Vídeo",
    categoria: "Design",
    preco: "R$ 120,00",
    nota: "4.8",
    cidade: "Curitiba - PR",
    imagem: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
  },
  {
    id: "5",
    titulo: "Aulas de Inglês",
    categoria: "Aulas",
    preco: "R$ 90,00",
    nota: "4.9",
    cidade: "Belo Horizonte - MG",
    imagem: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  },
  {
    id: "6",
    titulo: "Manutenção de Computadores",
    categoria: "Programação",
    preco: "R$ 70,00",
    nota: "4.7",
    cidade: "São Paulo - SP",
    imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
];

const CATEGORIAS = ["Todos", "Design", "Programação", "Aulas"];

export default function Servicos() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const servicosFiltrados = TODOS_SERVICOS.filter((item) => {
    const combinaCategoria = categoria === "Todos" || item.categoria === categoria;
    const combinaBusca = item.titulo.toLowerCase().includes(busca.toLowerCase());
    return combinaCategoria && combinaBusca;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#00AFFF" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Explorar serviços</Text>
        <View style={{ width: 26 }} />
      </View>

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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIAS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categorias}
        renderItem={({ item }) => {
          const ativo = item === categoria;
          return (
            <TouchableOpacity
              style={[styles.chip, ativo && styles.chipAtivo]}
              onPress={() => setCategoria(item)}
            >
              <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={servicosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum serviço encontrado.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <Image source={{ uri: item.imagem }} style={styles.imagem} />

            <View style={styles.info}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.categoria}</Text>
              </View>

              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.rating}>⭐ {item.nota}</Text>
              <Text style={styles.preco}>{item.preco}</Text>
              <Text style={styles.local}>📍 {item.cidade}</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    height: 54,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#0D1324",
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
  },
  categorias: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222",
    marginRight: 10,
  },
  chipAtivo: {
    backgroundColor: "#00AFFF",
    borderColor: "#00AFFF",
  },
  chipText: {
    color: "#999",
    fontWeight: "600",
  },
  chipTextAtivo: {
    color: "#000",
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vazio: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#0D1324",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#161D2E",
  },
  imagem: {
    width: 110,
    height: 110,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#00AFFF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  tagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardTitulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rating: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 4,
  },
  preco: {
    color: "#00AFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  local: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
});