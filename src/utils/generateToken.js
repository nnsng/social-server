import jwt from 'jsonwebtoken';

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}
