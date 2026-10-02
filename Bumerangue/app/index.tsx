import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tela inicial: quem já fez login vai para os anúncios, os demais para o menu de apresentação.
export default function Index() {
  const [destino, setDestino] = useState<"/anuncios" | "/menu" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("usuarioId")
      .then((id) => setDestino(id ? "/anuncios" : "/menu"))
      .catch(() => setDestino("/menu"));
  }, []);

  if (!destino) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0B", justifyContent: "center" }}>
        <ActivityIndicator color="#00AFFF" size="large" />
      </View>
    );
  }

  return <Redirect href={destino} />;
}
