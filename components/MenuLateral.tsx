import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MenuLateral() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function irPara(rota: string) {
    setAberto(false);
    router.push(rota as any);
  }

  return (
    <>
      {/* BOTÃO HAMBÚRGUER */}
      <TouchableOpacity
        style={styles.menuHamburguer}
        onPress={() => setAberto(!aberto)}
      >
        <Ionicons name="menu" size={30} color="#fff" />
      </TouchableOpacity>

      {/* PAINEL LATERAL */}
      {aberto && (
        <View style={styles.painel}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => irPara("/perfil")}
          >
            <Ionicons name="person-outline" size={24} color="#00AFFF" />
            <Text style={styles.itemTexto}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => irPara("/menu")}
          >
            <Ionicons name="home-outline" size={24} color="#00AFFF" />
            <Text style={styles.itemTexto}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => irPara("/ajuda")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#00AFFF" />
            <Text style={styles.itemTexto}>Ajuda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => setAberto(false)}
          >
            <Ionicons name="close-outline" size={24} color="#00AFFF" />
            <Text style={styles.itemTexto}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menuHamburguer: {
    padding: 4,
  },
  painel: {
    position: "absolute",
    top: 60,
    left: "50%",
    width: 280,
    marginLeft: -140, // metade da largura (280 / 2), pra centralizar de verdade
    backgroundColor: "#0D1324",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2433",
    elevation: 12,
    zIndex: 100,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  itemTexto: {
    color: "#E5E7EB",
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "500",
  },
});