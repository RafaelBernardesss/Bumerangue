import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput } from "react-native";
import { View } from "react-native";

export default function Pesquisa() {
    return (
        <View style={styles.pesquisa}>
            <Ionicons style={styles.icone} name="search" size={20} color="#00ff88" />
            <TextInput
                placeholder="Buscar serviços ..."
                placeholderTextColor="#888"
                style={styles.textoPesquisa}
            />

        </View>

    );
}


const styles = StyleSheet.create({
    pesquisa: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 40,
        borderWidth: 1,
        borderColor: "#D7D9DF",
        width:300,
    },
    textoPesquisa: {
        flex: 1,
        color: "#fff",
        marginLeft: 10,
        borderWidth: 0,
        borderColor: "#D7D9DF"
    },
    icone: {
        color: "#D7D9DF"
    },
})