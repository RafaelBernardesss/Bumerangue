// perfil.tsx
// Modelo inicial. Substitua as funções de salvar/excluir pela sua API.

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

//components
import Header from "../components/HeaderEscolha";

export default function Perfil() {
  const [foto, setFoto] = useState<string | null>(null);
  const [nome, setNome] = useState("João da Silva");
  const [email, setEmail] = useState("joao@email.com");
  const [telefone, setTelefone] = useState("(11) 99999-9999");
  const [cidade, setCidade] = useState("São Paulo");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");

  async function escolherFoto() {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) return Alert.alert("Permissão necessária");
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!r.canceled) setFoto(r.assets[0].uri);
  }

  function removerFoto() {
    setFoto(null);
  }

  function salvar() {
    Alert.alert("Sucesso", "Alterações salvas.");
  }

  function excluir() {
    Alert.alert("Excluir conta", "Deseja excluir sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => Alert.alert("Conta excluída") },
    ]);
  }

  const campos: [string, string, (v: string) => void][] = [
    ["Nome", nome, setNome],
    ["E-mail", email, setEmail],
    ["Telefone", telefone, setTelefone],
    ["Cidade", cidade, setCidade],
    ["Descrição", descricao, setDescricao],
    ["Nova senha", senha, setSenha],
  ];

  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Header></Header>
      </View>

      <ScrollView style={s.c} contentContainerStyle={{ padding: 20 }}>
        <Text style={s.t}>Meu Perfil</Text>
        <TouchableOpacity onPress={escolherFoto} style={s.center}>
          {foto ? (
            <Image source={{ uri: foto }} style={s.img} />
          ) : (
            <View style={s.imgPlaceholder}>
              <Text style={s.imgPlaceholderText}>{iniciais || "?"}</Text>
            </View>
          )}
          <Text style={s.link}>Alterar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={removerFoto}>
          <Text style={s.rem}>Remover foto</Text>
        </TouchableOpacity>

        {campos.map(([l, v, set]) => (
          <View key={l} style={{ marginTop: 16 }}>
            <Text style={s.lbl}>{l}</Text>
            <TextInput
              value={v}
              onChangeText={set}
              style={s.i}
              secureTextEntry={l === "Nova senha"}
              multiline={l === "Descrição"}
            />
          </View>
        ))}

        <TouchableOpacity style={s.btn} onPress={salvar}>
          <Text style={s.btnt}>Salvar Alterações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.del} onPress={excluir}>
          <Text style={s.btnt}>Excluir Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B"
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  c: {
    flex: 1,
    backgroundColor: "#0B0B0B"
  },
  t: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20
  },
  center: {
    alignItems: "center"
  },
  img: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#222"
  },
  imgPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  imgPlaceholderText: {
    color: "#00AFFF",
    fontSize: 36,
    fontWeight: "700"
  },
  link: {
    color: "#0AFFF",
    marginTop: 10
  },
  rem: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 8
  },
  lbl: {
    color: "#fff",
    marginBottom: 6
  },
  i: {
    backgroundColor: "#0D1324",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 12,
    color: "#fff",
    padding: 12
  },
  btn: {
    backgroundColor: "#00AFFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 24
  },
  del: {
    backgroundColor: "#D32F2F",
    padding: 16,
    borderRadius: 12,
    marginTop: 12
  },
  btnt: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center"
  },
});