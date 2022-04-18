import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import sendMail from '../config/sendMail.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { hashPassword, randomNumber } from '../utils/common.js';
import { env, variables } from '../utils/env.js';
import { generateAccessToken, generateActiveToken } from '../utils/generateToken.js';

const clientUrl = env(variables.clientUrl);

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      return res.status(400).send({
        name: 'emailNotRegister',
        message: 'Email have not registered yet.',
      });
    }

    loginUser(existedUser, password, res);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function register(req, res) {
  try {
    const { email, password, name, username } = req.body;

    const userInfo = {
      email,
      password,
      name,
      username,
      type: 'local',
    };

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).send({
        name: 'emailExist',
        message: 'Email already exist.',
      });
    }

    registerUser(userInfo, res);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;

    const clientId = env(variables.googleClientId);
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const { email, name, picture } = ticket.getPayload();

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      loginUser(existedUser, '', res);
    } else {
      const initUsername = name.replace(/\s+/g, '-');
      let username = initUsername;
      let isExist = true;
      while (isExist) {
        const existedUser = await User.findOne({ username }).lean();
        if (existedUser) username = initUsername + randomNumber();
        else isExist = false;
      }

      const newUser = {
        name,
        email,
        username,
        avatar: picture,
        password: email.split('@')[0],
        type: 'google',
        active: true,
      };

      registerUser(newUser, res);
    }
  } catch (error) {
    res.status(500).send(error);
  }
}

async function active(req, res) {
  try {
    const { token: activeToken } = req.body;

    const { _id } = jwt.verify(activeToken, env(variables.activeTokenSecret));

    if (!_id) {
      return res.status(401).send({
        name: 'invalidAuthen',
        message: 'Invalid authentication.',
      });
    }

    const user = await User.findById(_id).lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: 'User not found.',
      });
    }
    if (user.active) {
      return res.status(400).send({
        name: 'accountActive',
        message: 'Account is already active.',
      });
    }

    await User.updateOne({ _id }, { $set: { active: true } });
    const activatedUser = await User.findById(_id).select('-password -saved').lean();

    const accessToken = generateAccessToken({ _id });

    res.send({ user: activatedUser, token: accessToken });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getCurrentUser(req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).select('-password -saved').lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: 'User not found',
      });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function updateProfile(req, res) {
  try {
    const data = req.body;
    const { username } = data;
    const { _id } = req.user;

    const existedUser = await User.findOne({ username }).lean();
    if (existedUser && !existedUser._id.equals(_id)) {
      return res.status(400).send({
        name: 'usernameExist',
        message: 'Username already exist.',
      });
    }

    await User.updateOne({ _id }, { $set: data });

    const updatedUser = await User.findById(_id).select('-password -saved').lean();

    await Post.updateMany({ authorId: _id }, { $set: { author: updatedUser } });
    await Comment.updateMany({ userId: _id }, { $set: { user: updatedUser } });

    res.send(updatedUser);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function changePassword(req, res) {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const user = req.user;

    // Check password validity
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).send({
        name: 'passwordNotCorrect',
        message: 'Password is not correct.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(newPassword);

    await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function loginUser(user, password, res) {
  try {
    if (user.type === 'email') {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).send({
          name: 'passwordNotCorrect',
          message: 'Password is not correct.',
        });
      }
    }

    const loggedInUser = await User.findById(user._id).select('-password -saved').lean();
    if (!loggedInUser.active) {
      return res.status(400).send({
        name: 'activeAccount',
        message: 'Please active your account.',
      });
    }

    const accessToken = generateAccessToken({ _id: loggedInUser._id });

    res.send({ user: loggedInUser, token: accessToken });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function registerUser(user, res) {
  try {
    const hashedPassword = await hashPassword(user.password);

    const newUser = new User({ ...user, password: hashedPassword });
    await newUser.save();

    const activeToken = generateActiveToken({ _id: newUser._id });

    if (user.type === 'google') {
      const googleUser = await User.findById(newUser._id).select('-password -saved').lean();
      res.send({ user: googleUser, token: activeToken });
    }

    await sendMail(newUser.email, `${clientUrl}/active?token=${activeToken}`);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

const authCtrl = {
  register,
  login,
  googleLogin,
  active,
  getCurrentUser,
  updateProfile,
  changePassword,
};

export default authCtrl;
