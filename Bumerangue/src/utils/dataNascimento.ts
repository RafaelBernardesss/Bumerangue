export const IDADE_MINIMA = 18;

// Máscara DD/MM/AAAA enquanto a pessoa digita
export function formatarData(texto = "") {
  const numeros = texto.replace(/\D/g, "").slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

// Converte "DD/MM/AAAA" em Date. Devolve null se a data não existir (ex.: 31/02/2000).
export function lerData(texto: string): Date | null {
  const m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);

  const data = new Date(ano, mes - 1, dia);
  const real =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

  if (!real || ano < 1900 || data.getTime() > Date.now()) return null;
  return data;
}

export function calcularIdade(nascimento: Date, hoje = new Date()) {
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const jaFezAniversario =
    hoje.getMonth() > nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());
  if (!jaFezAniversario) idade -= 1;
  return idade;
}

/** Valida a data digitada e se a pessoa tem 18 anos ou mais. */
export function validarNascimento(texto: string): { ok: boolean; erro?: string } {
  const data = lerData(texto);

  if (!data) {
    return { ok: false, erro: "Informe uma data de nascimento válida (DD/MM/AAAA)." };
  }

  if (calcularIdade(data) < IDADE_MINIMA) {
    return { ok: false, erro: "O Bumerangue é permitido apenas para maiores de 18 anos." };
  }

  return { ok: true };
}
