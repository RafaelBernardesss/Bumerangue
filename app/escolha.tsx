import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Escolha() {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <SafeAreaView style={styles.container}>

            {/* MENU HAMBURGUER */}
            <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setMenuAberto(!menuAberto)}
            >
                <Ionicons name="menu" size={28} color="#3EC8FF" />
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
                        <Ionicons name="person-outline" size={20} color="#3EC8FF" />
                        <Text style={styles.itemMenuText}>Perfil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.itemMenu}
                        onPress={() => {
                            setMenuAberto(false);
                            router.push("/menu");
                        }}
                    >
                        <Ionicons name="home-outline" size={20} color="#3EC8FF" />
                        <Text style={styles.itemMenuText}>Menu</Text>
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
                        <Text style={styles.itemMenuText}>Ajuda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.itemMenu}
                        onPress={() => setMenuAberto(false)}
                    >
                        <Ionicons name="close-outline" size={20} color="#3EC8FF" />
                        <Text style={styles.itemMenuText}>Fechar</Text>
                    </TouchableOpacity>

                </View>
            )}

             <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={36} color="#fff" />
                      </View>
                    </View>

            {/* BOTÕES CENTRALIZADOS */}
            <View style={styles.centerContainer}>

                <TouchableOpacity style={styles.botaoPrimario} onPress={() => router.push("/login")}>
                    <Text style={styles.botaoTexto}>
                        Já tenho uma conta
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoSegundario} onPress={() => router.push("/cadastro")}>
                    <Text style={styles.botaoSecundarioTexto}>
                        Não tenho uma conta
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

    // CENTRALIZAÇÃO
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    // BOTÕES
    botaoPrimario: {
        width: 280,
        height: 50,
        backgroundColor: "#3EC8FF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    botaoTexto: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },

    botaoSegundario: {
        width: 280,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        justifyContent: "center",
        alignItems: "center",
    },

    botaoSecundarioTexto: {
        color: "#3EC8FF",
        fontSize: 14,
        fontWeight: "500",
    },

    // MENU HAMBURGUER
    menuBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 100,
        padding: 10,
        borderRadius: 50,
        backgroundColor: "rgba(62,200,255,0.1)",
    },

    // MENU LATERAL
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
        zIndex: 99,
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

    //AVATAR
     avatarContainer: {
    alignItems:"center",
    justifyContent:"center",
    position: "absolute",
    top: 230,
    left: 140,
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3EC8FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

});