import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/HeaderEscolha";

export default function PublicarServico() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Header></Header>
      </View>

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Ofereça seu serviço</Text>
        <Text style={styles.subtitle}>
          Preencha as informações abaixo para publicar seu serviço.
        </Text>
      </View>

      {/* Título do serviço */}
      <Text style={styles.label}>Título do serviço</Text>
      <TextInput
        style={styles.input}
        placeholder="Criação de Sites Profissionais"
        placeholderTextColor="#888"
      />

      {/* Categoria */}
      <Text style={styles.label}>Categoria</Text>
      <TextInput
        style={styles.input}
        placeholder="Programação"
        placeholderTextColor="#888"
      />

      {/* Descrição */}
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={5}
        placeholder="Descreva seu serviço..."
        placeholderTextColor="#888"
      />

      {/* Preço e Tempo */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Preço</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 150,00"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Tempo de entrega</Text>
          <TextInput
            style={styles.input}
            placeholder="2 dias"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Tags */}
      <Text style={styles.label}>Tags (até 5)</Text>

      <View style={styles.tagsContainer}>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>React</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>React Native</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>JavaScript</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>Design</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>HTML/CSS</Text>
        </TouchableOpacity>
      </View>

      {/* Upload */}
      <Text style={styles.label}>Imagem / Portfólio</Text>

      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={40} color="#00AFFF" />
        <Text style={styles.uploadText}>
          Clique para enviar imagens
        </Text>
        <Text style={styles.uploadSub}>PNG ou JPG até 10MB</Text>
      </TouchableOpacity>

      {/* Disponibilidade e Localização */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Disponibilidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Online agora"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Localização</Text>
          <TextInput
            style={styles.input}
            placeholder="São Paulo - SP"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Botão */}
      <TouchableOpacity style={styles.button}>
        <Ionicons name="paper-plane" size={20} color="#fff" />
        <Text style={styles.buttonText}>PUBLICAR SERVIÇO</Text>
      </TouchableOpacity>

      {/* Preview */}
      <Text style={styles.previewTitle}>Seu anúncio ficará assim:</Text>

      <View style={styles.card}>
        <View style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>João Silva ✓</Text>

          <Text style={styles.serviceTitle}>
            Criação de Sites Profissionais
          </Text>

          <Text style={styles.rating}>★★★★★ (32 avaliações)</Text>

          <Text style={styles.info}>
            Entrega em 2 dias • São Paulo - SP
          </Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>R$ 150,00</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    padding: 20,
  },

  header: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    color: "#00AFFF",
    fontSize: 28,
    fontWeight: "bold",
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

  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#00AFFF",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  half: {
    width: "48%",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#00AFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  tagText: {
    color: "#00AFFF",
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: "#00AFFF",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    marginTop: 10,
  },

  uploadText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },

  uploadSub: {
    color: "#888",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#00AFFF",
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
    fontSize: 18,
  },

  previewTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#0D1626",
    borderWidth: 1,
    borderColor: "#1F3C5E",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
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
    fontSize: 18,
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
});