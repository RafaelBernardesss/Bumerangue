
export default function ValidarCpf(cpf: string): boolean {
  const numeros = (cpf || "").replace(/\D/g, "");

  if (numeros.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(numeros)) return false;

  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digito(numeros.slice(0, 9), 10);
  const d2 = digito(numeros.slice(0, 10), 11);

  return d1 === Number(numeros[9]) && d2 === Number(numeros[10]);
}
