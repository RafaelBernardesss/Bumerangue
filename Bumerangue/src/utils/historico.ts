import AsyncStorage from "@react-native-async-storage/async-storage";

// Histórico de anúncios visualizados (guardado só no celular, separado por usuário).
const LIMITE = 20;

export type ItemHistorico = {
  id: number;
  titulo: string;
  descricao: string;
  foto: string | null;
  usuarioNome: string;
  criadoEm: string;
  visitadoEm: string;
};

type AnuncioParaHistorico = {
  id: number;
  titulo: string;
  descricao?: string | null;
  foto?: string | null;
  criadoEm?: string | null;
  usuario?: { nome?: string | null } | null;
};

async function chave() {
  const usuarioId = await AsyncStorage.getItem("usuarioId");
  return `historicoAnuncios:${usuarioId ?? "visitante"}`;
}

export async function buscarHistorico(): Promise<ItemHistorico[]> {
  try {
    const bruto = await AsyncStorage.getItem(await chave());
    if (!bruto) return [];

    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? (lista as ItemHistorico[]) : [];
  } catch (erro) {
    console.log("Erro ao ler histórico:", erro);
    return [];
  }
}

/** Coloca o anúncio no topo do histórico (sem repetir) e mantém só os 20 mais recentes. */
export async function adicionarAoHistorico(anuncio: AnuncioParaHistorico | null | undefined) {
  if (!anuncio?.id) return;

  try {
    const atual = await buscarHistorico();

    const novo: ItemHistorico = {
      id: anuncio.id,
      titulo: anuncio.titulo,
      descricao: anuncio.descricao ?? "",
      foto: anuncio.foto ?? null,
      usuarioNome: anuncio.usuario?.nome ?? "",
      criadoEm: anuncio.criadoEm ?? new Date().toISOString(),
      visitadoEm: new Date().toISOString(),
    };

    const lista = [novo, ...atual.filter((item) => item.id !== anuncio.id)].slice(0, LIMITE);
    await AsyncStorage.setItem(await chave(), JSON.stringify(lista));
  } catch (erro) {
    console.log("Erro ao salvar histórico:", erro);
  }
}

export async function limparHistorico() {
  try {
    await AsyncStorage.removeItem(await chave());
  } catch (erro) {
    console.log("Erro ao limpar histórico:", erro);
  }
}
