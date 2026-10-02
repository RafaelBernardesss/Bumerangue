import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const PREFIXO = "enc:v1:";

function obterSegredo() {
  if (process.env.CHAT_SECRET) return process.env.CHAT_SECRET;

  const novo = crypto.randomBytes(32).toString("hex");
  const arquivoEnv = path.resolve(".env");

  try {
    const atual = fs.existsSync(arquivoEnv) ? fs.readFileSync(arquivoEnv, "utf8") : "";
    const separador = atual && !atual.endsWith("\n") ? "\n" : "";
    fs.appendFileSync(arquivoEnv, `${separador}CHAT_SECRET=${novo}\n`);
    console.warn("[criptografia] CHAT_SECRET criada e salva no .env. Faça backup desse arquivo.");
  } catch (erro) {
    throw new Error("Defina CHAT_SECRET no .env para criptografar as mensagens.");
  }

  process.env.CHAT_SECRET = novo;
  return novo;
}

let chaveCache = null;
function chave() {
  if (!chaveCache) {
    chaveCache = crypto.createHash("sha256").update(obterSegredo()).digest(); // 32 bytes
  }
  return chaveCache;
}

/** Criptografa um texto com AES-256-GCM. Cada mensagem usa um IV aleatório. */
export function criptografar(texto) {
  const valor = String(texto ?? "");
  const iv = crypto.randomBytes(12);
  const cifra = crypto.createCipheriv("aes-256-gcm", chave(), iv);
  const cifrado = Buffer.concat([cifra.update(valor, "utf8"), cifra.final()]);
  const tag = cifra.getAuthTag();
  return PREFIXO + Buffer.concat([iv, tag, cifrado]).toString("base64");
}

export function estaCriptografado(valor) {
  return typeof valor === "string" && valor.startsWith(PREFIXO);
}

/**
 * Descriptografa. Mensagens antigas (salvas antes da criptografia) são devolvidas como estão,
 * então o app continua funcionando durante a migração.
 */
export function descriptografar(valor) {
  if (!estaCriptografado(valor)) return valor;

  try {
    const bruto = Buffer.from(valor.slice(PREFIXO.length), "base64");
    const iv = bruto.subarray(0, 12);
    const tag = bruto.subarray(12, 28);
    const cifrado = bruto.subarray(28);

    const decifra = crypto.createDecipheriv("aes-256-gcm", chave(), iv);
    decifra.setAuthTag(tag);
    return Buffer.concat([decifra.update(cifrado), decifra.final()]).toString("utf8");
  } catch (erro) {
    console.error("[criptografia] Não foi possível descriptografar uma mensagem:", erro.message);
    return "[mensagem indisponível]";
  }
}
