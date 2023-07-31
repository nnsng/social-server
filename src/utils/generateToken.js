import jwt from 'jsonwebtoken';
import { env, variables } from './env.js';

export const generateActiveToken = (payload) => {
  return jwt.sign(payload, env(variables.activeTokenSecret), { expiresIn: '5m' });
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env(variables.accessTokenSecret), { expiresIn: '7d' });
};
