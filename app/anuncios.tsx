import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const servicos = [
    {
      titulo: "Criação de Sites",
      categoria: "DESIGN",
      preco: "R$ 150,00",
      nota: "5.0",
      cidade: "São Paulo - SP",
      imagem:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    },
    {
      titulo: "Desenvolvimento Web",
      categoria: "PROGRAMAÇÃO",
      preco: "R$ 200,00",
      nota: "4.9",
      cidade: "Rio de Janeiro - RJ",
      imagem:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    },
    {
      titulo: "Aulas de Matemática",
      categoria: "AULAS",
      preco: "R$ 80,00",
      nota: "5.0",
      cidade: "São Paulo - SP",
      imagem:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="menu" size={34} color="#fff" />

          <Text style={styles.logo}>Bumerangue</Text>

          <View>
            <Ionicons name="notifications-outline" size={30} color="#fff" />

            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </View>

        {/* BOAS VINDAS */}
        <View style={styles.welcomeContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Olá, Usuario!</Text>

            <Text style={styles.subtitle}>
              Bem-vindo de volta! Encontre serviços incríveis ou ofereça sua
              ajuda.
            </Text>
          </View>

          <View>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              style={styles.avatar}
            />

            <View style={styles.online} />
          </View>
        </View>

        {/* PESQUISA */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={24} color="#999" />

            <TextInput
              placeholder="Buscar serviços..."
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={24} color="#fff" />
            <Text style={styles.filterText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* AÇÕES */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.circle, { backgroundColor: "#00AFFF" }]}>
              <Ionicons name="compass-outline" size={26} color="#000" />
            </View>

            <Text style={styles.actionTitle}>Explorar serviços</Text>
            <Text style={styles.actionSubtitle}>Ver todos disponíveis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.circle, { backgroundColor: "#9B4DFF" }]}>
              <Ionicons name="time-outline" size={26} color="#000" />
            </View>

            <Text style={styles.actionTitle}>Histórico</Text>
            <Text style={styles.actionSubtitle}>Serviços realizados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.circle, { backgroundColor: "#00FF44" }]}>
              <Ionicons name="add-circle-outline" size={26} color="#000" />
            </View>

            <Text style={styles.actionTitle}>Oferecer serviço</Text>
            <Text style={styles.actionSubtitle}>Publique um serviço</Text>
          </TouchableOpacity>
        </View>

        {/* SERVIÇOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços em destaque</Text>
          <Text style={styles.link}>Ver todos</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {servicos.map((item, index) => (
            <View key={index} style={styles.serviceCard}>
              <Image
                source={{ uri: item.imagem }}
                style={styles.serviceImage}
              />

              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.categoria}</Text>
              </View>

              <TouchableOpacity style={styles.favorite}>
                <Ionicons
                  name="heart-outline"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{item.titulo}</Text>

                <Text style={styles.rating}>
                  ⭐ {item.nota}
                </Text>

                <Text style={styles.price}>{item.preco}</Text>

                <Text style={styles.location}>
                  📍 {item.cidade}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* HISTÓRICO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seu histórico recente</Text>
          <Text style={styles.link}>Ver todos</Text>
        </View>

        <View style={styles.historyCard}>
          {[
            {
              nome: "Criação de Logo",
              valor: "R$ 100,00",
            },
            {
              nome: "Correção de Bug",
              valor: "R$ 80,00",
            },
            {
              nome: "Aulas de Física",
              valor: "R$ 70,00",
            },
          ].map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color="#00FF44"
                />

                <View>
                  <Text style={styles.historyTitle}>
                    {item.nome}
                  </Text>

                  <Text style={styles.historySubtitle}>
                    Serviço concluído
                  </Text>
                </View>
              </View>

              <Text style={styles.historyPrice}>
                {item.valor}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Ionicons name="home" size={30} color="#00AFFF" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="search" size={30} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={36} color="#00AFFF" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons
            name="chatbubble-outline"
            size={30}
            color="#999"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="person-outline" size={30} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B18",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  logo: {
    color: "#00AFFF",
    fontSize: 34,
    fontWeight: "bold",
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
    padding: 20,
    marginTop: 20,
  },

  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#999",
    fontSize: 18,
    marginTop: 10,
    lineHeight: 28,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  online: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00FF44",
    position: "absolute",
    bottom: 10,
    right: 5,
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
    padding: 15,
  },

  circle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  actionTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "600",
  },

  actionSubtitle: {
    color: "#888",
    marginTop: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
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

  historyCard: {
    backgroundColor: "#0D1324",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
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