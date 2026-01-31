import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export function generateToken(userId, email, res) {
	const payload = { jti: crypto.randomUUID(), id: userId, email }
	const token = jwt.sign(payload, process.env.JWT, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	})

	console.log(token)

	res.cookie('jwt', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
		maxAge: (1000 * 60 * 60 * 24) * 7,
	})
	return token
}
