const { decryptData } = require("../utils/security.util");

const checkEncrypted = () => {
	return (req, res, next) => {
		const { email, password } = req.body;

		if (!email && !password) {
			next();
		}

		if (email) {
			const decryptedEmail = decryptData(email);
			if (decryptedEmail.length === 0) {
				return res.status(422).json({
					status: "error",
					message: "Email should be in encrypted formate",
				});
			}
		}

		if (password) {
			const decryptedPassword = decryptData(password);
			if (decryptedPassword.length === 0) {
				return res.status(422).json({
					status: "error",
					message: "Password should be in encrypted formate",
				});
			}
		}

		next();
	};
};

module.exports = { checkEncrypted };
