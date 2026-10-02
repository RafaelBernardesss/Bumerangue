import Constants from "expo-constants";
import { Platform } from "react-native";


const PORTA = 3000;


function descobrirUrl(): string {
  const manual = process.env.EXPO_PUBLIC_API_URL;
  if (manual) return manual.replace(/\/+$/, "");

  const c: any = Constants;
  const hostUri: string | undefined =
    c.expoConfig?.hostUri ??
    c.expoGoConfig?.debuggerHost ??
    c.manifest2?.extra?.expoGo?.debuggerHost ??
    c.manifest?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:${PORTA}`;

  
  if (Platform.OS === "android") return `http://10.0.2.2:${PORTA}`;
  return `http://localhost:${PORTA}`;
}

export const API_URL = descobrirUrl();

export function urlArquivo(caminho?: string | null): string | null {
  if (!caminho) return null;
  if (/^(https?:|file:|content:)/.test(caminho)) return caminho;
  return `${API_URL}/${caminho.replace(/\\/g, "/")}`;
}
