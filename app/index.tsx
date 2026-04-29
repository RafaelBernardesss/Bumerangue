import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
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
          <Text style={styles.logo}>Bumerangue</Text>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.title}>Troque serviços, não dinheiro</Text>

          <Text style={styles.subtitle}>
            Ajude alguém hoje e receba ajuda depois.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>Oferecer serviço</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Encontrar ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* COMO FUNCIONA */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitleDark}>Como funciona</Text>

          <View style={styles.cards}>
            <Card title="Ofereça" text="Publique algo que você sabe fazer" />
            <Card title="Encontre" text="Descubra pessoas que precisam" />
            <Card title="Troque" text="Ajude alguém e receba ajuda depois" />
          </View>
        </View>

        {/* SERVIÇOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços populares</Text>

          <View style={styles.services}>
            <Card title="Design" />
            <Card title="Programação" />
            <Card title="Aulas" />
            <Card title="Conserto" />
            <Card title="Fotografia" />
            <Card title="Edição de vídeo" />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Comece hoje</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.buttonText}>Criar Conta</Text>
          </TouchableOpacity>
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
      style={[styles.card, hover && styles.cardHover]}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {text && <Text style={styles.cardText}>{text}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#000",
  },

  logo: {
    fontSize: 28,
    color: "#3EC8FF",
    fontWeight: "bold",
  },

  hero: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#CCC",
    marginTop: 10,
    textAlign: "center",
    maxWidth: 500,
  },

  heroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },

  primaryButton: {
    backgroundColor: "#3EC8FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 5,
  },

  secondaryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 5,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },

  secondaryText: {
    color: "#000",
    fontWeight: "bold",
  },

  section: {
    padding: 20,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  sectionWhite: {
    backgroundColor: "#FFF",
    padding: 20,
  },

  sectionTitleDark: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },

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
    padding: 15,
    borderRadius: 10,
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
  },

  cardText: {
    color: "#CCC",
    marginTop: 5,
    fontSize: 12,
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