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

export default function App() {
    const router = useRouter()
    return (
        <View style={styles.container}>
            <View style={styles.barlogin}>
                <Text style={styles.txtcadastro}>Cadastre-se</Text>
                <Text style={styles.txtusername}>Username:</Text>
                <TextInput placeholder="Digite seu nome"></TextInput>
                <Text style={styles.txtemail}>Email:</Text>
                <TextInput placeholder="exemple@gmail.com"></TextInput>
                <Text style={styles.txtsenha}>Senha:</Text>
                <TextInput placeholder="******"></TextInput>
                <TouchableOpacity>Criar conta</TouchableOpacity>
                <Text style={styles.login}>Já tenho uma conta</Text>
            </View>

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
    },
    barlogin:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
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
    login:{
        color:"white",
    }
    //inputs
    
});