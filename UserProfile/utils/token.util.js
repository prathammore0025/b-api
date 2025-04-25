require("dotenv").config();
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.Encrypted_S_Key;

const generateAccessToken = (user, expiresIn = "1h") => {
	return jwt.sign(
		{
			...user,
		},
		SECRET_KEY,
		{ expiresIn }
	);
};

const decodeAccessToken = (token) => {
	const decode = jwt.decode(token);
	return decode;
};

module.exports = { generateAccessToken, decodeAccessToken };
