import jwt from 'jsonwebtoken';
import { env, variables } from './env.js';

const tokenData = {
  active: {
    secret: env(variables.activeTokenSecret),
    expiresIn: '5m',
  },
  access: {
    secret: env(variables.accessTokenSecret),
    expiresIn: '15m',
  },
  refresh: {
    secret: env(variables.refreshTokenSecret),
    expiresIn: '30d',
  },
};

export default function generateToken(type, payload) {
  const { secret, expiresIn } = tokenData[type];
  return jwt.sign(payload, secret, { expiresIn });
}
