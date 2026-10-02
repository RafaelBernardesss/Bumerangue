import prisma from "../prisma/client.js";

const CATEGORIAS_PADRAO = [
  "Design",
  "Programação",
  "Aulas",
  "Consertos",
  "Limpeza",
  "Culinária",
  "Fotografia",
  "Música",
  "Jardinagem",
  "Beleza",
  "Transporte",
  "Outros",
];

/** Cria as categorias iniciais se o banco ainda não tiver nenhuma (para o app já abrir utilizável). */
export async function garantirCategoriasPadrao() {
  const total = await prisma.categoria.count();
  if (total > 0) return;

  for (const nome of CATEGORIAS_PADRAO) {
    await prisma.categoria.upsert({ where: { nome }, update: {}, create: { nome } });
  }
  console.log(`[banco] ${CATEGORIAS_PADRAO.length} categorias iniciais criadas.`);
}
