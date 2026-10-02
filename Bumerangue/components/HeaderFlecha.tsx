import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Botão de voltar usado no topo das telas.
export default function HeaderFlecha() {
  const router = useRouter();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/menu");
    }
  }

  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={voltar}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Voltar"
    >
      <Ionicons name="arrow-back" size={26} color="#00AFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    padding: 4,
  },
});
