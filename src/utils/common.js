import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const createToken = (payload) => {
	return jwt.sign(payload, process.env.TOKEN_SECRET);
};

export const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};
