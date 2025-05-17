import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../utils/env.js';

export const auth = async (req, res, next) => {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) {
      return res.status(401).json(generateErrorResponse('auth.accessDenied'));
    }

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json(generateErrorResponse('auth.invalidAuth'));
    }

    const user = await User.findById(decoded._id).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};
