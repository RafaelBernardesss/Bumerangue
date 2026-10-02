export const IDADE_MINIMA = 18;

export function lerDataNascimento(valor) {
  if (!valor || typeof valor !== "string") return null;
  const texto = valor.trim();

  let dia, mes, ano;
  let m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    [, dia, mes, ano] = m;
  } else {
    m = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    [, ano, mes, dia] = m;
  }

  dia = Number(dia);
  mes = Number(mes);
  ano = Number(ano);

  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const real =
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;

  if (!real || ano < 1900) return null;
  if (data.getTime() > Date.now()) return null;

  return data;
}

export function calcularIdade(nascimento, hoje = new Date()) {
  const n = new Date(nascimento);
  let idade = hoje.getFullYear() - n.getUTCFullYear();
  const jaFezAniversario =
    hoje.getMonth() > n.getUTCMonth() ||
    (hoje.getMonth() === n.getUTCMonth() && hoje.getDate() >= n.getUTCDate());
  if (!jaFezAniversario) idade -= 1;
  return idade;
}

export function ehMaiorDeIdade(nascimento, hoje = new Date()) {
  return calcularIdade(nascimento, hoje) >= IDADE_MINIMA;
}

export const MENSAGEM_MENOR_DE_IDADE =
  "O Bumerangue é permitido apenas para maiores de 18 anos.";
