import jwt from 'jsonwebtoken';
import { env } from './env.js';

export const generateActiveToken = (payload) => {
  return jwt.sign(payload, env.ACTIVE_TOKEN_SECRET, { expiresIn: '5m' });
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
};
