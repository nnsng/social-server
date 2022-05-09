import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorMessages } from '../utils/constants.js';
import { env, variables } from '../utils/env.js';

async function checkAdmin(req, res, next) {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) {
      return res.status(403).send({
        name: 'accessDenied',
        message: errorMessages['accessDenied'],
      });
    }

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env(variables.accessTokenSecret));
    if (!decoded) {
      return res.status(403).send({
        name: 'invalidAuth',
        message: errorMessages['invalidAuth'],
      });
    }

    const user = await User.findOne({ _id: decoded._id }).select('-password').lean();
    if (!user) {
      return res.status(400).send({
        name: 'userNotFound',
        message: errorMessages['userNotFound'],
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).send({
        name: 'accessDenied',
        message: errorMessages['accessDenied'],
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ name: 'invalidToken', message: errorMessages['invalidToken'] });
  }
}

export default checkAdmin;
