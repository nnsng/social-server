import jwt from 'jsonwebtoken';

export default function (req, res, next) {
	const headerAuthorization = req.header('Authorization');
	if (!headerAuthorization) return res.status(401).send('Access Denied');

	const token = headerAuthorization.split(' ')[1];

	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = verified;
		next();
	} catch (error) {
		res.status(400).send('Invalid token');
	}
}
