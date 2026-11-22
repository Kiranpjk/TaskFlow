import crypto from 'node:crypto';
import config from '../config.js';

const unauthorized = (res) =>
  res.status(401).json({
    error: 'Unauthorized access. Please provide valid credentials.'
  });

// Constant-time string comparison to avoid leaking credentials via timing.
const safeEqual = (a, b) => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return unauthorized(res);
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
  // Split on the first colon only: passwords may contain ':'.
  const sep = credentials.indexOf(':');
  if (sep === -1) {
    return unauthorized(res);
  }
  const username = credentials.slice(0, sep);
  const password = credentials.slice(sep + 1);

  const userOk = safeEqual(username, config.authUsername);
  const passOk = safeEqual(password, config.authPassword);
  if (userOk && passOk) {
    return next();
  }
  return unauthorized(res);
};

export default basicAuth;
