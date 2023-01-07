import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env, variables } from '../utils/env.js';

export async function admin(req, res, next) {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) {
      return res.status(403).json(generateErrorResponse('auth.accessDenied'));
    }

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env(variables.accessTokenSecret));
    if (!decoded) {
      return res.status(403).json(generateErrorResponse('auth.invalidAuth'));
    }

    const user = await User.findOne({ _id: decoded._id }).select('-password').lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    if (user.role !== 'admin') {
      return res.status(403).json(generateErrorResponse('auth.accessDenied'));
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json(generateErrorResponse('auth.invalidToken'));
  }
}
