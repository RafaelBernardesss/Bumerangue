import React from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from "react-native";
import { Button } from "@react-navigation/elements";

export default function App() {
    const router = useRouter()
    return (
        <View style={styles.container}>
            <View style={styles.barlogin}>
                <Text style={styles.txtcadastro}>Cadastre-se</Text>
                <Text style={styles.txtusername}>Username:</Text>
                <TextInput style={styles.inputusername} placeholder="Digite seu nome"></TextInput>
                <Text style={styles.txtemail}>Email:</Text>
                <TextInput style={styles.inputemail} placeholder="exemple@gmail.com"></TextInput>
                <Text style={styles.txtsenha}>Senha:</Text>
                <TextInput style={styles.inputsenha} placeholder="******"></TextInput>
                <TouchableOpacity style={styles.botao}>
                    <Text style={{ color: "#000" }}>Criar conta</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text onPress={() => router.push("/login")} style={styles.login}>Já tenho uma conta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
    },
    barlogin: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    //Textos
    txtcadastro: {
        color: "white",
    },
    txtusername: {
        color: "white",
    },
    txtemail: {
        color: "white",
    },
    txtsenha: {
        color: "white",
    },
    login: {
        color: "white",
    },
    //inputs
    inputusername:{
        backgroundColor: "white",
    },
    inputemail:{
        backgroundColor: "white",
    },
    inputsenha:{
        backgroundColor: "white",
    },
    //botões
    botao: {
        backgroundColor: "#3EC8FF",
        width: 200,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginTop: 10
    }
});