import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput } from "react-native";
import { View } from "react-native";

export default function Pesquisa() {
    return (
        <View style={styles.pesquisa}>
            <Ionicons name="search" size={20} color="#00ff88" />
            <TextInput
                placeholder="Buscar serviços ..."
                placeholderTextColor="#888"
                style={styles.textoPesquisa}
            />

        </View>

    );
}


const styles = StyleSheet.create({
    pesquisa:{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: "#00ff88"
    },
    textoPesquisa:{

    }
})