import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <View style={styles.container}>
            {/* BOTÃO HAMBURGUER */}
            <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setMenuAberto(!menuAberto)}
            >
                <Ionicons name="menu" size={35} color="white" />
            </TouchableOpacity>

            {/* MENU LATERAL */}
            {menuAberto && (
                <View style={styles.menuLateral}>
                    <TouchableOpacity
                        onPress={() => {
                            setMenuAberto(false);
                            router.push("/perfil");
                        }}
                    >
                        <Text style={styles.itemMenu}>Perfil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setMenuAberto(false);
                            router.push("/menu");
                        }}
                    >
                        <Text style={styles.itemMenu}>Menu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setMenuAberto(false);
                            router.push("/ajuda");
                        }}
                    >
                        <Text style={styles.itemMenu}>Ajuda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setMenuAberto(false)}
                    >
                        <Text style={styles.itemMenu}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* CONTEÚDO */}
            <View style={styles.barlogin}>
                <Text style={styles.txtcadastro}>Cadastre-se</Text>

                <Text style={styles.txtusername}>Nome Completo:</Text>
                <TextInput
                    style={styles.inputusername}
                    placeholder="Digite seu nome"
                    placeholderTextColor="#777"
                />



                <Text style={styles.txtcpf}>CPF:</Text>
                <TextInput
                    style={styles.inputcpf}
                    placeholder="CPF"
                    placeholderTextColor="#777"
                />

                <Text style={styles.txtemail}>Email:</Text>
                <TextInput
                    style={styles.inputemail}
                    placeholder="exemplo@gmail.com"
                    placeholderTextColor="#777"
                />

                <Text style={styles.txtsenha}>Senha:</Text>
                <TextInput
                    style={styles.inputsenha}
                    placeholder="******"
                    placeholderTextColor="#777"
                    secureTextEntry={true}
                />

                <TouchableOpacity style={styles.botao}>
                    <Text style={styles.txtbutton}>Criar conta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/login")}
                >
                    <Text style={styles.login}>Já tenho uma conta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
    },

    barlogin: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },

    /* MENU */
    menuBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 100,
        elevation: 10,
        padding: 5,
    },

    menuLateral: {
        position: "absolute",
        top: 95,
        left: 15,
        width: 220,
        backgroundColor: "#222",
        padding: 15,
        borderRadius: 10,
        zIndex: 99,
        elevation: 10,
    },

    itemMenu: {
        color: "white",
        fontSize: 18,
        marginBottom: 15,
        fontWeight: "bold",
    },

    /* TEXTOS */
    txtcadastro: {
        color: "white",
        fontWeight: "bold",
        fontSize: 30,
        marginBottom: 20,
    },

    txtusername: {
        color: "white",
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginLeft: 80,
    },

    txtemail: {
        color: "white",
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginLeft: 80,
    },
    txtcpf: {
        color: "white",
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginLeft: 80,
    },

    txtsenha: {
        color: "white",
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginLeft: 80,
    },

    txtbutton: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },

    login: {
        color: "white",
        fontWeight: "bold",
        marginTop: 15,
    },

    /* INPUTS */
    inputusername: {
        backgroundColor: "white",
        height: 45,
        width: 220,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    inputemail: {
        backgroundColor: "white",
        height: 45,
        width: 220,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    inputcpf: {
        backgroundColor: "white",
        height: 45,
        width: 220,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    inputsenha: {
        backgroundColor: "white",
        height: 45,
        width: 220,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },

    /* BOTÃO */
    botao: {
        backgroundColor: "#3EC8FF",
        width: 220,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginTop: 5,
    },
});