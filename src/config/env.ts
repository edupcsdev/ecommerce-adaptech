import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Variável de ambiente JWT_SECRET não definida');
}

export const env = {
  JWT_SECRET,
  JWT_EXPIRACAO: '2h' as const,
  RESERVA_MINUTOS: Number(process.env.RESERVA_MINUTOS) > 0 ? Number(process.env.RESERVA_MINUTOS) : 30,
};