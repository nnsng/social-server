import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';
import { User } from '../models/index.js';
import { hashPassword, randomNumber } from '../utils/common.js';
import { env } from '../utils/env.js';
import { generateAccessToken, generateActiveToken } from '../utils/generateToken.js';
import { generateErrorResponse } from '../utils/response.js';
import sendMail, { sendMailTypes } from '../utils/sendMail.js';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      return res.status(400).json(generateErrorResponse('auth.emailNotRegister'));
    }

    const data = { user: existedUser, password };
    loginUser(data, req, res);
  } catch (error) {
    res.status(500).json(error);
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    const userInfo = {
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
      username: username.toLowerCase(),
      type: 'local',
    };

    let existedUser = await User.findOne({ email }).lean();
    if (existedUser) {
      return res.status(400).json(generateErrorResponse('auth.emailExist'));
    }
    existedUser = await User.findOne({ username }).lean();
    if (existedUser) {
      return res.status(400).json(generateErrorResponse('auth.usernameExist'));
    }

    registerUser(userInfo, req, res);
  } catch (error) {
    res.status(500).json(error);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const clientId = env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const { email, name, picture } = ticket.getPayload();

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      const data = { user: existedUser, password: '' };
      loginUser(data, req, res);
    } else {
      const initUsername = slugify(name, {
        trim: true,
        replacement: '-',
        lower: true,
        locale: 'vi',
      });
      let username = initUsername;
      let isExist = true;
      while (isExist) {
        const existedUser = await User.findOne({ username }).lean();
        if (existedUser) {
          username = initUsername + randomNumber(0, 1000);
        } else {
          isExist = false;
        }
      }

      const newUser = {
        name,
        email,
        username,
        avatar: picture,
        password: '',
        type: 'google',
        active: false,
      };

      registerUser(newUser, req, res);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const active = async (req, res) => {
  try {
    const { token } = req.body;

    const { _id } = jwt.verify(token, env.ACTIVE_TOKEN_SECRET);

    if (!_id) {
      return res.status(401).json(generateErrorResponse('auth.invalidAuth'));
    }

    const user = await User.findById(_id).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }
    if (user.active) {
      return res.status(400).json(generateErrorResponse('auth.alreadyActive'));
    }

    await User.updateOne({ _id }, { $set: { active: true } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const reactive = async (req, res) => {
  try {
    const { clientUrl } = req.query;
    const { _id } = req.body;

    if (!_id) {
      return res.status(401).json(generateErrorResponse('auth.invalidAuth'));
    }

    const user = await User.findById(_id).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }
    if (user.active) {
      return res.status(400).json(generateErrorResponse('auth.alreadyActive'));
    }

    const activeToken = generateActiveToken({ _id });

    await sendMail({
      mailto: user.email,
      url: `${clientUrl}/active?token=${activeToken}`,
      type: sendMailTypes.activeAccount,
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const user = req.user;

    // Check password validity
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json(generateErrorResponse('auth.passwordNotCorrect'));
    }

    // Hash password
    const hashedPassword = await hashPassword(newPassword);

    await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { clientUrl } = req.query;
    const { email } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(400).json(generateErrorResponse('auth.emailNotRegister'));
    }

    const activeToken = generateActiveToken({ _id: user._id });

    await sendMail({
      mailto: email,
      url: `${clientUrl}/password?token=${activeToken}`,
      type: sendMailTypes.resetPassword,
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, env.ACTIVE_TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json(generateErrorResponse('auth.invalidAuth'));
    }

    const user = await User.findById(decoded._id).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword, active: true } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const loginUser = async ({ user, password }, req, res) => {
  try {
    if (password.length !== 0) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json(generateErrorResponse('auth.passwordNotCorrect'));
      }
    }

    const loggedInUser = await User.findById(user._id).select('-password -saved').lean();
    if (!loggedInUser.active) {
      return res.status(400).json(generateErrorResponse('auth.alreadyActive'));
    }

    const accessToken = generateAccessToken({ _id: loggedInUser._id });

    res.send({ user: loggedInUser, token: accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
};

const registerUser = async (user, req, res) => {
  try {
    const { clientUrl } = req.query;

    const hashedPassword = await hashPassword(user.password);

    const newUser = new User({ ...user, password: hashedPassword });
    await newUser.save();
    const { _id, email } = newUser;

    const activeToken = generateActiveToken({ _id });

    if (user.type === 'google') {
      const accessToken = generateAccessToken({ _id });
      const googleUser = await User.findById(_id).select('-password -saved').lean();
      return res.send({ user: googleUser, token: accessToken, activeToken });
    }

    await sendMail({
      mailto: email,
      url: `${clientUrl}/active?token=${activeToken}`,
      type: sendMailTypes.activeAccount,
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const authCtrl = {
  register,
  login,
  googleLogin,
  active,
  reactive,
  changePassword,
  forgotPassword,
  resetPassword,
};

export default authCtrl;
