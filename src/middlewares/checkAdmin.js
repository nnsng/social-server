import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env, variables } from '../utils/env.js';

async function checkAdmin(req, res, next) {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) {
      return res.status(403).send({
        name: 'accessDenied',
        message: 'Access Denied.',
      });
    }

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env(variables.accessTokenSecret));
    if (!decoded) {
      return res.status(403).send({
        name: 'invalidAuth',
        message: 'Invalid Authentication.',
      });
    }

    const user = await User.findOne({ _id: decoded._id }).select('-password').lean();
    if (!user) {
      return res.status(400).send({
        name: 'userNotFound',
        message: 'User not found.',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).send({
        name: 'accessDenied',
        message: 'Access Denied.',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ name: 'invalidToken', message: 'Invalid token' });
  }
}

export default checkAdmin;
