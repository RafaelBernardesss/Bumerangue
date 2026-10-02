import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { API_URL } from "../constants/api";

export async function registrarPushToken() {
  try {
    const usuarioId = await AsyncStorage.getItem("usuarioId");
    if (!usuarioId) return;

    if (!Device.isDevice) return;

    if (
      Platform.OS === "android" &&
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ) {
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return;

    const projectId =
      (Constants.expoConfig?.extra as any)?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return;

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    await fetch(`${API_URL}/usuarios/${usuarioId}/push-token`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pushToken }),
    });
  } catch (erro) {
    console.log("Não foi possível registrar o token de notificação:", erro);
  }
}
