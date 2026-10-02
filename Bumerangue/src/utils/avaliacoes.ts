import { API_URL } from "../../constants/api";

export type ResumoAvaliacao = {
  media: number;
  total: number;
};

/**
 * Busca a média e o total de avaliações de vários usuários de uma vez.
 * Devolve { [usuarioId]: { media, total } }. Em caso de erro devolve {} (as telas mostram "Sem avaliações").
 */
export async function buscarResumo(ids: number[]): Promise<Record<number, ResumoAvaliacao>> {
  const unicos = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)));
  if (unicos.length === 0) return {};

  try {
    const resposta = await fetch(`${API_URL}/avaliacoes/resumo?ids=${unicos.join(",")}`);
    if (!resposta.ok) return {};

    const dados = await resposta.json();
    return (dados?.resumo ?? {}) as Record<number, ResumoAvaliacao>;
  } catch (erro) {
    console.log("Erro ao buscar avaliações:", erro);
    return {};
  }
}
