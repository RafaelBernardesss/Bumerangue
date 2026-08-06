// Perfil.jsx
// Modelo inicial. Substitua as funções de salvar/excluir pela sua API.

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Perfil() {
  const [foto, setFoto] = useState(null);
  const [nome, setNome] = useState("João da Silva");
  const [email, setEmail] = useState("joao@email.com");
  const [telefone, setTelefone] = useState("(11) 99999-9999");
  const [cidade, setCidade] = useState("São Paulo");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");

  async function escolherFoto() {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) return Alert.alert("Permissão necessária");
    const r = await ImagePicker.launchImageLibraryAsync({mediaTypes: ImagePicker.MediaTypeOptions.Images, quality:1});
    if (!r.canceled) setFoto(r.assets[0].uri);
  }

  function removerFoto(){ setFoto(null); }
  function salvar(){ Alert.alert("Sucesso","Alterações salvas."); }
  function excluir(){
    Alert.alert("Excluir conta","Deseja excluir sua conta?",[
      {text:"Cancelar",style:"cancel"},
      {text:"Excluir",style:"destructive",onPress:()=>Alert.alert("Conta excluída")}
    ]);
  }

  return (
    <ScrollView style={s.c} contentContainerStyle={{padding:20}}>
      <Text style={s.t}>Meu Perfil</Text>
      <TouchableOpacity onPress={escolherFoto} style={s.center}>
        <Image source={foto?{uri:foto}:require("./assets/avatar-placeholder.png")} style={s.img}/>
        <Text style={s.link}>Alterar foto</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={removerFoto}><Text style={s.rem}>Remover foto</Text></TouchableOpacity>
      {[
        ["Nome",nome,setNome],["E-mail",email,setEmail],["Telefone",telefone,setTelefone],["Cidade",cidade,setCidade],["Descrição",descricao,setDescricao],["Nova senha",senha,setSenha]
      ].map(([l,v,set])=>(
        <View key={l} style={{marginTop:16}}>
          <Text style={s.lbl}>{l}</Text>
          <TextInput value={v} onChangeText={set} style={s.i} secureTextEntry={l==="Nova senha"} multiline={l==="Descrição"}/>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={salvar}><Text style={s.btnt}>Salvar Alterações</Text></TouchableOpacity>
      <TouchableOpacity style={s.del} onPress={excluir}><Text style={s.btnt}>Excluir Conta</Text></TouchableOpacity>
    </ScrollView>
  );
}
const s=StyleSheet.create({
c:{flex:1,backgroundColor:"#050B18"},
t:{color:"#fff",fontSize:28,fontWeight:"700",marginBottom:20},
center:{alignItems:"center"},
img:{width:120,height:120,borderRadius:60,backgroundColor:"#222"},
link:{color:"#00AFFF",marginTop:10},
rem:{color:"#ff6b6b",textAlign:"center",marginTop:8},
lbl:{color:"#fff",marginBottom:6},
i:{backgroundColor:"#0D1324",borderWidth:1,borderColor:"#1E293B",borderRadius:12,color:"#fff",padding:12},
btn:{backgroundColor:"#00AFFF",padding:16,borderRadius:12,marginTop:24},
del:{backgroundColor:"#D32F2F",padding:16,borderRadius:12,marginTop:12},
btnt:{color:"#fff",fontWeight:"700",textAlign:"center"}
});