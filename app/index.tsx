import React from "react";
import{ useState } from 'react';
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable
} from "react-native";


const screenWidth = Dimensions.get("window").width;

export default function App() {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  return (
    <ScrollView style={styles.container}>

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

        <TouchableOpacity style={styles.primaryButton}>
          <Text onPress={() => router.push("/cadastro")} style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

/* CARD COMPONENT */

type CardProps = {
  title: string
  text?: string
}

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

  container: {
    flex: 1,
    backgroundColor: "#0B0B0B"
  },

  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#000"
  },

  logo: {
    fontSize: 28,
    color: "#3EC8FF",
    position:"absolute",
    top: 40,
    fontWeight: "bold"
  },

  hero: {
    padding: 50,
    alignItems: "center"
  },

  title: {
    fontSize: 26,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center"
  },

  subtitle: {
    color: "#CCC",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20
  },

  heroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20
  },

  primaryButton: {
    backgroundColor: "#3EC8FF",
    padding: 12,
    borderRadius: 8,
    margin: 5,
  },

  secondaryButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    margin: 5
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold"
  },

  secondaryText: {
    color: "#000",
    fontWeight: "bold"
  },

  section: {
    padding: 25
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25
  },

  sectionWhite: {
    backgroundColor: "#FFF",
    padding: 20
  },

  sectionTitleDark: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20
  },

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#3EC8FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: screenWidth * 0.3
  },

  cardTitle: {
    color: "#FFF",
    fontWeight: "bold"
  },

  cardText: {
    color: "#CCC",
    marginTop: 5,
    fontSize: 12
  },

  cta: {
    alignItems: "center"
  },

  ctaTitle: {
    color: "#FFF",
    fontSize: 24,
    marginBottom: 20
  },
  cardHover: {
  backgroundColor: "#3EC8FF",
  }
});
