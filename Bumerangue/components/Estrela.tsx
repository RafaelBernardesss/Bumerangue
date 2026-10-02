import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ResumoAvaliacao } from "../src/utils/avaliacoes";

type Props = {
  resumo?: ResumoAvaliacao | null;
  tamanho?: number;
};

export default function Estrelas({ resumo, tamanho = 14 }: Props) {
  const media = resumo?.media ?? 0;
  const total = resumo?.total ?? 0;

  if (!resumo || total === 0) {
    return (
      <View style={styles.linha}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons key={n} name="star-outline" size={tamanho} color="#4B5563" />
        ))}
        <Text style={styles.semAvaliacao}>Sem avaliações</Text>
      </View>
    );
  }

  return (
    <View style={styles.linha}>
      {[1, 2, 3, 4, 5].map((n) => {
        let nome: "star" | "star-half" | "star-outline" = "star-outline";
        if (media >= n - 0.25) nome = "star";
        else if (media >= n - 0.75) nome = "star-half";

        return (
          <Ionicons
            key={n}
            name={nome}
            size={tamanho}
            color={nome === "star-outline" ? "#4B5563" : "#FFB800"}
          />
        );
      })}
      <Text style={styles.texto}>
        {media.toFixed(1).replace(".", ",")} ({total})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  texto: {
    color: "#9CA3AF",
    fontSize: 12,
    marginLeft: 6,
  },
  semAvaliacao: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 6,
  },
});
