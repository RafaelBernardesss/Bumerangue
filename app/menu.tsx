import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.title}>
            Troque serviços, não dinheiro
          </Text>

          <Text style={styles.subtitle}>
            Ajude alguém hoje e receba ajuda depois.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/escolha")}
            >
              <Text style={styles.buttonText}>
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/ajuda")}
            >
              <Text style={styles.secondaryText}>
                Encontrar ajuda
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* COMO FUNCIONA */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitleDark}>
            Como funciona
          </Text>

          <View style={styles.cards}>
            <Card
              title="Ofereça"
              text="Publique algo que você sabe fazer"
            />

            <Card
              title="Encontre"
              text="Descubra pessoas que precisam"
            />

            <Card
              title="Troque"
              text="Ajude alguém e receba ajuda depois"
            />
          </View>
        </View>

        {/* SERVIÇOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Serviços populares
          </Text>

          <View style={styles.services}>
            <Card title="Design" />
            <Card title="Programação" />
            <Card title="Aulas" />
            <Card title="Conserto" />
            <Card title="Fotografia" />
            <Card title="Edição de vídeo" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* CARD */
type CardProps = {
  title: string;
  text?: string;
};

function Card({ title, text }: CardProps) {
  const [hover, setHover] = useState(false);

  return (
    <Pressable
      style={[
        styles.card,
        hover && styles.cardHover,
      ]}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
    >
      <Text style={styles.cardTitle}>
        {title}
      </Text>

      {text && (
        <Text style={styles.cardText}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    width: "100%",
    height: 190,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  logoImage: {
    width: "100%",
    height: 190,
  },

  /* HERO */
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 45,
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 700,
  },

  subtitle: {
    color: "#CCC",
    marginTop: 12,
    textAlign: "center",
    maxWidth: 500,
    fontSize: 16,
    lineHeight: 24,
  },

  heroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30,
  },

  primaryButton: {
    backgroundColor: "#3EC8FF",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    margin: 5,
  },

  secondaryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    margin: 5,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },

  secondaryText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },

  /* SECTIONS */
  section: {
    padding: 20,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  sectionWhite: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  sectionTitleDark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },

  /* CARDS */
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },

  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },

  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#3EC8FF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
    width: screenWidth > 700 ? "30%" : "47%",
    minWidth: 140,
  },

  cardHover: {
    backgroundColor: "#3EC8FF",
  },

  cardTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  cardText: {
    color: "#CCC",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },

  cta: {
    alignItems: "center",
    padding: 30,
  },

  ctaTitle: {
    color: "#FFF",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
});