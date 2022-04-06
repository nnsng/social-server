import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import sendMail from '../config/sendMail.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/common.js';
import { TOKEN } from '../utils/constants.js';
import { env, variables } from '../utils/env.js';
import generateToken from '../utils/generateToken.js';

const clientUrl = env(variables.clientUrl);

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) return res.status(400).send({ message: 'Email have not registered yet' });

    loginUser(existedUser, password, res);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userParams = {
      email,
      password,
      name: `${firstName} ${lastName}`,
      type: 'local',
    };

    const existedUser = await User.findOne({ email: userParams.email });
    if (existedUser) return res.status(400).send({ message: 'Email is exist' });

    registerUser(userParams, res);
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
      const newUser = {
        name,
        email,
        avatar: picture,
        password: '123456',
        type: 'google',
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

    if (!_id) return res.status(400).send({ message: 'Invalid authentication.' });

    const user = await User.findById(_id).lean();
    if (!user) return res.status(400).send({ message: 'User not found' });
    if (user.active) return res.status(400).send({ message: 'User is already active.' });

    await User.updateOne({ _id }, { $set: { active: true } });
    const activatedUser = await User.findById(_id).select('-password -saved').lean();

    const token = generateToken(TOKEN.ACTIVE, { _id });

    res.send({ user: activatedUser, token });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function refreshToken(req, res) {
  const { token: refreshToken } = req.body;

  try {
    const { _id } = jwt.verify(refreshToken, env(variables.refreshTokenSecret));
    if (!_id) return res.status(400).send({ message: 'Invalid authentication.' });

    const user = await User.findById(_id).lean();
    if (!user) return res.status(400).send({ message: 'User not found' });

    const accessToken = generateToken(TOKEN.ACCESS, { _id });

    res.send({ accessToken });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getCurrentUser(req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).select('-password -saved').lean();
    if (!user) return res.status(404).send({ message: 'User not found' });

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

    const existedUsername = await User.findOne({ username }).lean();
    if (existedUsername && !existedUsername._id.equals(_id))
      return res.status(400).send({ message: 'Username is exist' });

    await User.updateOne({ _id }, { $set: data });

    const updatedUser = await User.findById(_id).select('-password -saved').lean();

    const user = {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
    };

    await Post.updateMany({ authorId: _id }, { $set: { author: user } });
    await Comment.updateMany({ userId: _id }, { $set: { user } });

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
    if (!validPassword) return res.status(400).send({ message: 'Password is not correct' });

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
      if (!validPassword) return res.status(400).send({ message: 'Password is not correct' });
    }

    const loggedInUser = await User.findById(user._id).select('-password -saved').lean();
    if (!loggedInUser.active)
      return res.status(400).send({ message: 'Please active your account' });

    const accessToken = generateToken(TOKEN.ACCESS, { _id: loggedInUser._id });
    const refreshToken = generateToken(TOKEN.REFRESH, { _id: loggedInUser._id });

    res.send({ user: loggedInUser, accessToken, refreshToken });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function registerUser(user, res) {
  try {
    const hashedPassword = await hashPassword(user.password);

    const newUser = new User({ ...user, password: hashedPassword });
    await newUser.save();

    const activeToken = generateToken(TOKEN.ACTIVE, { _id: newUser._id });

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
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
};

export default authCtrl;
