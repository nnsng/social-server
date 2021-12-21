import jwt from 'jsonwebtoken';

export function generateActiveToken(payload) {
	return jwt.sign(payload, process.env.ACTIVE_TOKEN_SECRET, {
		expiresIn: '5m',
	});
}

export function generateAccessToken(payload) {
	return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}

export function generateRefreshToken(payload) {
	return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
}
