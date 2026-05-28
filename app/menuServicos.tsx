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
import Pesquisa from "../imports/pesquisa";

import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

export default function MenuServico (){
  return(
    <SafeAreaView style={{ flex:1, backgroundColor:"#050B14"}}>
      <Text style={styles.text1}>Ola, Usuario</Text>
      <Text>FUNCIONANDO COM SUCESSO</Text>
      <Pesquisa/>
      

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  text1:{

  },
})