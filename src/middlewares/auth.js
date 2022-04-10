import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env, variables } from '../utils/env.js';

async function auth(req, res, next) {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) {
      return res.status(401).send({
        name: 'accessDenied',
        message: 'Access Denied.',
      });
    }

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env(variables.accessTokenSecret));
    if (!decoded) {
      return res.status(401).send({
        name: 'invalidAuthen',
        message: 'Invalid Authentication.',
      });
    }

    const user = await User.findOne({ _id: decoded._id }).lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: 'User not found.',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).send(error);
  }
}

export default auth;
