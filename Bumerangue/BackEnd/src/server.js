import "dotenv/config";
import os from "os";
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";

import prisma from "./prisma/client.js";
import rotaUsuario from "./routes/rota-usuario.js";
import rotaAnuncio from "./routes/rota-anuncio.js";
import rotaCategoria from "./routes/rota-categoria.js";
import rotaProposta from "./routes/rota-proposta.js";
import rotaTroca from "./routes/rota-troca.js";
import rotaAvaliacao from "./routes/rota-avaliacao.js";
import rotaMensagem from "./routes/rota-mensagem.js";
import { garantirCategoriasPadrao } from "./utils/categoriasPadrao.js";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

for (const pasta of ["perfil", "chat", "anuncios", "troca"]) {
  fs.mkdirSync(path.resolve("uploads", pasta), { recursive: true });
}
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => res.json({ ok: true, app: "Bumerangue API" }));

app.use("/usuarios", rotaUsuario);
app.use("/anuncios", rotaAnuncio);
app.use("/categorias", rotaCategoria);
app.use("/propostas", rotaProposta);
app.use("/troca", rotaTroca);
app.use("/avaliacoes", rotaAvaliacao);
app.use("/mensagens", rotaMensagem);

app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(erro.status || 500).json({ erro: erro.message || "Erro interno do servidor" });
});

function enderecosDaRede() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);
}

async function iniciar() {
  try {
    await prisma.$connect();
    await garantirCategoriasPadrao();
  } catch (erro) {
    console.error("\nNão foi possível abrir o banco de dados.");
    console.error("Rode 'npm run db:setup' dentro da pasta BackEnd para criar o banco e gerar o Prisma Client.\n");
    console.error(erro);
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\nBumerangue API rodando na porta ${PORT}`);
    console.log(`  Local:  http://localhost:${PORT}`);
    for (const ip of enderecosDaRede()) console.log(`  Rede:   http://${ip}:${PORT}`);
    console.log("");
  });
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

iniciar();
