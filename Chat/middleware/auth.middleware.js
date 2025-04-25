const jwt = require("jsonwebtoken");
const { getAuthenticationData } = require("../sockets/auth.socket");

const authMiddleware = async (req, res, next) => {
	if (req.headers.authorization === null) {
		return res.status(401).json({
			status: "fail",
			message: "authorization token is required",
		});
	}

	if (!req.headers.authorization?.startsWith("Bearer")) {
		return res.status(401).json({
			status: "fail",
			message: "bearer token is required",
		});
	}

	const token = req.headers.authorization.split(" ")[1];

	try {
		const user = await jwt.verify(token, process.env.Encrypted_S_Key);

		const userData = await getAuthenticationData({ user_id: user.user_id });

		const requestor = userData;

		if (!requestor) {
			return res.status(401).json({ message: "Invalid token" });
		}

		const currentTime = Math.floor(Date.now() / 1000);
		if (user.exp && user.exp < currentTime) {
			return res
				.status(401)
				.json({ message: "Token expired. Please log in again." });
		}

		req.requestor = requestor;
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({
			status: "fail",
			message: error.message || "an error occurred while logging in the user",
		});
	}
};

module.exports = authMiddleware;