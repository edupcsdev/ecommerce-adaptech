// Aceita somente AAAA-MM-DD, data real, entre 1900 e hoje

export function dataNascimentoValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const existe =
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
  return existe && ano >= 1900 && data.getTime() <= Date.now();
}

export function calcularIdade(dataNascimento: string, hoje = new Date()): number {
  const [ano, mes, dia] = dataNascimento.split('-').map(Number);
  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const jaFezAniversario = mesAtual > mes || (mesAtual === mes && hoje.getDate() >= dia);
  if (!jaFezAniversario) idade--;
  return idade;
}