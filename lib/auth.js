import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import crypto from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'hccsne-secret-2026';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom, photo: user.photo, specialite: user.specialite },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setTokenCookie(res, token) {
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
}

export function clearTokenCookie(res) {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
}

function parseCookieHeader(header) {
  if (!header) return {};
  if (typeof cookie?.parse === 'function') {
    return cookie.parse(header);
  }
  if (typeof cookie?.parseCookie === 'function') {
    return cookie.parseCookie(header);
  }
  if (typeof cookie?.default?.parse === 'function') {
    return cookie.default.parse(header);
  }
  const result = {};
  header.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) result[k] = decodeURIComponent(v.join('='));
  });
  return result;
}

export function verifyToken(req) {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  if (!cookies.token) return null;
  try { return jwt.verify(cookies.token, JWT_SECRET); }
  catch { return null; }
}

export function generateVerifyToken() {
  return crypto.randomBytes(32).toString('hex');
}
