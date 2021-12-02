import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { createToken, hashPassword } from '../utils/common.js';

export const signUpWithEmail = async (req, res) => {
	const { email, password, firstName, lastName } = req.body;

	const formData = {
		email,
		password,
		name: `${lastName} ${firstName}`,
		phone: '',
	};

	try {
		// Check if the user is already registered
		const existedUser = await User.findOne({ email: formData.email });
		if (existedUser)
			return res.status(400).send({ message: 'Email đã tồn tại' });

		// Hash password
		const hashedPassword = await hashPassword(formData.password);

		const newUser = new User({ ...formData, password: hashedPassword });
		const savedUser = await newUser.save();

		const { password, saved, ...user } = savedUser?._doc;

		const token = createToken(user);
		res.send(token);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const signInWithEmail = async (req, res) => {
	const { email, password: signInPassword } = req.body;

	try {
		// Check if user is not registered
		const existedUser = await User.findOne({ email }).lean();
		if (!existedUser)
			return res.status(400).send({ message: 'Email is not registered' });

		// Check password validity
		const validPassword = await bcrypt.compare(
			signInPassword,
			existedUser.password
		);
		if (!validPassword)
			return res.status(400).send({ message: 'Password is invalid' });

		// Create and sign token
		const { password, saved, ...user } = existedUser;
		const token = createToken(user);
		res.send(token);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const signInWithGoogle = async (req, res) => {
	const { idToken } = req.body;

	const clientId = process.env.GOOGLE_CLIENT_ID;
	const client = new OAuth2Client(clientId);

	try {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: clientId,
		});

		const payload = ticket.getPayload();

		const existedUser = await User.findOne({ email: payload.email }).lean();
		let token;

		if (existedUser) {
			const { password, saved, ...user } = existedUser;
			token = createToken(user);
		} else {
			const hashedPassword = await hashPassword(payload.email.split('@')[0]);
			const newUser = new User({
				name: payload.name,
				email: payload.email,
				avatar: payload.picture,
				password: hashedPassword,
			});
			await newUser.save();
			const { password, ...user } = newUser;
			token = createToken(user);
		}

		res.send(token);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const updateProfile = async (req, res) => {
	const data = req.body;
	const { _id } = data;

	try {
		await User.updateOne({ _id }, { $set: data });

		const updatedProfile = await User.findOne({ _id }).lean();

		const { password, saved, ...user } = updatedProfile;

		await Post.updateMany({ authorId: user._id }, { $set: { author: user } });

		await Comment.updateMany({ userId: user._id }, { $set: { user } });

		const token = createToken(user);
		res.send(token);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const changePassword = async (req, res) => {
	const { userId, currentPassword, newPassword } = req.body;

	try {
		const user = await User.findOne({ _id: userId });

		// Check password validity
		const validPassword = await bcrypt.compare(currentPassword, user.password);
		if (!validPassword)
			return res.status(400).send({ message: 'Current password is invalid' });

		// Hash password
		const hashedPassword = await hashPassword(newPassword);

		const updatedProfile = await User.updateOne(
			{ _id: userId },
			{ $set: { password: hashedPassword } }
		);
		res.send(updatedProfile);
	} catch (error) {
		res.status(400).send(error);
	}
};
