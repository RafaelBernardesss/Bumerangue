import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import Pesquisa from "../imports/pesquisa.tsx";

import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

export default function MenuServico (){
  return(
    <SafeAreaView>
      <Text>FUNCIONANDO COM SUCESSO</Text>
      <Pesquisa></Pesquisa>

    </SafeAreaView>
  )
}