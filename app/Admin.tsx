import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type Usuario = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
};

export default function Admin() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  async function buscarUsuarios() {
    try {
      const response = await fetch(
        "http://172.30.1.25:3000/usuarios/listar"
      );
      const data = await response.json();

      if (response.ok) {
        setUsuarios(data.usuarios);
      } else {
        Alert.alert("Erro", "Não foi possível carregar os usuários.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    buscarUsuarios();
  }, []);

  function confirmarExclusao(id: number, nome: string) {
    Alert.alert(
      "Remover conta",
      `Tem certeza que deseja remover a conta de ${nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deletarUsuario(id),
        },
      ]
    );
  }

  async function deletarUsuario(id: number) {
    try {
      const response = await fetch(
        `http://172.30.1.25:3000/usuarios/deletar/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
      } else {
        Alert.alert("Erro", "Não foi possível remover essa conta.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }

  function onRefresh() {
    setAtualizando(true);
    buscarUsuarios();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#00AFFF" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Gerenciar Contas</Text>
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#00AFFF"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={onRefresh}
              tintColor="#00AFFF"
            />
          }
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma conta encontrada.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.detalhe}>CPF: {item.cpf}</Text>
                <Text style={styles.detalhe}>Email: {item.email}</Text>
              </View>

              <TouchableOpacity
                style={styles.botaoDeletar}
                onPress={() => confirmarExclusao(item.id, item.nome)}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 14,
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  vazio: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 16,
    marginBottom: 12,
  },
  nome: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detalhe: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  botaoDeletar: {
    backgroundColor: "#FF3B3B",
    padding: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
});