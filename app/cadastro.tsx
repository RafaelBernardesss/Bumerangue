import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cadastro() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function cadastrar() {
    try {
      const response = await fetch(
        "http://172.30.0.110:3000/usuarios/cadastro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nome,
            cpf,
            email,
            senha,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Sucesso",
          "Conta criada com sucesso!"
        );

        router.push("/login");
      } else {
        Alert.alert("Erro", data.erro);
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor"
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* MENU HAMBURGUER */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => setMenuAberto(!menuAberto)}
      >
        <Ionicons
          name="menu"
          size={28}
          color="#3EC8FF"
        />
      </TouchableOpacity>

      {/* MENU LATERAL */}
      {menuAberto && (
        <View style={styles.menuLateral}>
          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() => {
              setMenuAberto(false);
              router.push("/perfil");
            }}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color="#3EC8FF"
            />
            <Text style={styles.itemMenuText}>
              Perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() => {
              setMenuAberto(false);
              router.push("/menu");
            }}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#3EC8FF"
            />
            <Text style={styles.itemMenuText}>
              Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() => {
              setMenuAberto(false);
              router.push("/ajuda");
            }}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="#3EC8FF"
            />
            <Text style={styles.itemMenuText}>
              Ajuda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() =>
              setMenuAberto(false)
            }
          >
            <Ionicons
              name="close-outline"
              size={20}
              color="#3EC8FF"
            />
            <Text style={styles.itemMenuText}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CONTEÚDO */}
      <View style={styles.formContainer}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={36}
              color="#fff"
            />
          </View>
        </View>

        <Text style={styles.title}>
          Cadastre-se
        </Text>

        <Text style={styles.subtitle}>
          Crie sua conta e faça parte da
          nossa comunidade
        </Text>

        {/* INPUTS */}
        <Text style={styles.label}>
          Nome Completo
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#777"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>
          CPF
        </Text>

        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#777"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
        />

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="exemplo@gmail.com"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>
          Senha
        </Text>

        <TextInput
          style={styles.input}
          placeholder="******"
          placeholderTextColor="#777"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.botaoPrimario}
          onPress={cadastrar}
        >
          <Text style={styles.botaoTexto}>
            Criar conta
          </Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() =>
            router.push("/login")
          }
        >
          <Text
            style={
              styles.botaoSecundarioTexto
            }
          >
            Já tenho uma conta
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  formContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#3EC8FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  menuBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
    padding: 10,
    borderRadius: 50,
    backgroundColor:
      "rgba(62,200,255,0.1)",
  },

  menuLateral: {
    position: "absolute",
    top: 100,
    left: 15,
    width: 220,
    backgroundColor: "#111111",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    elevation: 10,
    zIndex: 100,
  },

  itemMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  itemMenuText: {
    color: "#E5E7EB",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "500",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    color: "#A1A1AA",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },

  label: {
    alignSelf: "flex-start",
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 10,
  },

  botaoPrimario: {
    width: "100%",
    height: 50,
    backgroundColor: "#3EC8FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  botaoTexto: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },

  botaoSecundario: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  botaoSecundarioTexto: {
    color: "#3EC8FF",
    fontSize: 14,
    fontWeight: "500",
  },
});