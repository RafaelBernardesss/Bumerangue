export const TEMPO_ONLINE_MS = 70 * 1000;

export function estaOnline(ultimoAcesso) {
  if (!ultimoAcesso) return false;
  return Date.now() - new Date(ultimoAcesso).getTime() <= TEMPO_ONLINE_MS;
}

export function limiteOnline() {
  return new Date(Date.now() - TEMPO_ONLINE_MS);
}
