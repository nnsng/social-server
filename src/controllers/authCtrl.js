import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/common.js';
import { generateAccessToken } from '../utils/generateToken.js';

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const existedUser = await User.findOne({ email });
		if (!existedUser)
			return res.status(400).send({ message: 'Email chưa được đăng ký' });

		loginUser(existedUser, password, res);
	} catch (error) {
		res.status(400).send(error);
	}
};

const register = async (req, res) => {
	try {
		const { email, password, firstName, lastName } = req.body;

		const userParams = {
			email,
			password,
			name: `${firstName} ${lastName}`,
			type: 'local',
		};

		const existedUser = await User.findOne({ email: userParams.email });
		if (existedUser)
			return res.status(400).send({ message: 'Email đã tồn tại' });

		registerUser(userParams, res);
	} catch (error) {
		res.status(400).send(error);
	}
};

const googleLogin = async (req, res) => {
	try {
		const { idToken } = req.body;

		const clientId = process.env.GOOGLE_CLIENT_ID;
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
		res.status(400).send(error);
	}
};

const getCurrentUser = async (req, res) => {
	try {
		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const { _id } = req.user;
		const user = await User.findById(_id).select('-password -saved').lean();

		res.send(user);
	} catch (error) {
		res.status(400).send(error);
	}
};

const updateProfile = async (req, res) => {
	try {
		const data = req.body;
		const { username } = data;

		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const { _id } = req.user;

		const existedUsername = await User.findOne({ username });
		if (existedUsername && existedUsername._id.toString() !== _id)
			return res.status(400).send({ message: 'Tên người dùng đã tồn tại' });

		await User.updateOne({ _id }, { $set: data });

		const updatedUser = await User.findById(_id)
			.select('-password -saved')
			.lean();

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
		res.status(400).send(error);
	}
};

const changePassword = async (req, res) => {
	try {
		const { userId, currentPassword, newPassword } = req.body;

		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const user = req.user;

		// Check password validity
		const validPassword = await bcrypt.compare(currentPassword, user.password);
		if (!validPassword)
			return res
				.status(400)
				.send({ message: 'Mật khẩu hiện tại không chính xác' });

		// Hash password
		const hashedPassword = await hashPassword(newPassword);

		await User.updateOne(
			{ _id: userId },
			{ $set: { password: hashedPassword } }
		);
		res.sendStatus(200);
	} catch (error) {
		res.status(400).send(error);
	}
};

const loginUser = async (user, password, res) => {
	try {
		if (user.type === 'email') {
			const validPassword = await bcrypt.compare(password, user.password);
			if (!validPassword)
				return res.status(400).send({ message: 'Mật khẩu không chính xác' });
		}

		const loggedInUser = await User.findById(user._id)
			.select('-password -saved')
			.lean();

		const token = generateAccessToken({ _id: loggedInUser._id });

		res.send({ user: loggedInUser, token });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
};

const registerUser = async (user, res) => {
	try {
		const hashedPassword = await hashPassword(user.password);

		const newUser = new User({ ...user, password: hashedPassword });
		await newUser.save();

		const savedUser = await User.findOne({ email: user.email })
			.select('-password -saved')
			.lean();

		const token = generateAccessToken({ _id: savedUser._id });

		res.send({ user: savedUser, token });
	} catch (error) {
		res.status(400).send(error);
	}
};

const authCtrl = {
	register,
	login,
	googleLogin,
	getCurrentUser,
	updateProfile,
	changePassword,
};

export default authCtrl;
