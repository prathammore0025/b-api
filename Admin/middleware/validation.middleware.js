function formatErrorMessages(errors) {
	return errors.map((error) => error.message.replace(/"/g, "")).join(", ");
}

const validateRequest = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false });

		if (error) {
			console.log(error);
			return res.status(400).json({
				status: "error",
				message: formatErrorMessages(error.details),
			});
		}
		next();
	};
};

module.exports = { validateRequest };
