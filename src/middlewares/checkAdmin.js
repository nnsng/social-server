import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env, variables } from '../utils/env.js';

async function checkAdmin(req, res, next) {
  try {
    const headerAuthorization = req.header('Authorization');
    if (!headerAuthorization) return res.status(403).send({ message: 'Access Denied.' });

    const token = headerAuthorization.split(' ')[1];

    const decoded = jwt.verify(token, env(variables.accessTokenSecret));
    if (!decoded) return res.status(403).send({ message: 'Invalid Authentication.' });

    const user = await User.findOne({ _id: decoded._id }).select('-password').lean();
    if (!user) return res.status(400).send({ message: 'User does not exist.' });

    if (user.role !== 'admin') return res.status(403).send({ message: 'Access Denied.' });

    req.user = user;

    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
}

export default checkAdmin;
