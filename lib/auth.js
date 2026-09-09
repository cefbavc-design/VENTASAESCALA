import crypto from 'crypto';

const COOKIE_NAME = 'qr_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Falta configurar SESSION_SECRET en las variables de entorno');
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [user, expiresStr, signature] = parts;
  const payload = `${user}.${expiresStr}`;
  const expected = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  const expires = Number(expiresStr);
  if (Number.isNaN(expires) || Date.now() > expires) return false;

  return true;
}

export function checkCredentials(user, password) {
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD;
  if (!validPassword) return false;
  return user === validUser && password === validPassword;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

// Helper para usar dentro de API routes (Node runtime): valida la firma
// completa de la cookie de sesión, no sólo su presencia.
export function isAuthenticated(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

