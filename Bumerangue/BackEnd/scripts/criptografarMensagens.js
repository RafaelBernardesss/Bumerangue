import prisma from "../src/prisma/client.js";
import { criptografar, estaCriptografado } from "../src/utils/criptografia.js";

const mensagens = await prisma.mensagem.findMany({ select: { id: true, conteudo: true } });

let convertidas = 0;
for (const m of mensagens) {
  if (estaCriptografado(m.conteudo)) continue;
  await prisma.mensagem.update({
    where: { id: m.id },
    data: { conteudo: criptografar(m.conteudo) },
  });
  convertidas++;
}

console.log(`${convertidas} mensagem(ns) criptografada(s) de um total de ${mensagens.length}.`);
await prisma.$disconnect();
