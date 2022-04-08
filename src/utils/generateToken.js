import jwt from 'jsonwebtoken';
import { env, variables } from './env.js';

export function generateActiveToken(payload) {
  return jwt.sign(payload, env(variables.activeTokenSecret), { expiresIn: '5m' });
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, env(variables.accessTokenSecret));
}
