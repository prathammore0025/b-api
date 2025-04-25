const URLnotFoundHandler = (req, res) => {
	return res.status(400).json({ status: "fail", message: "Unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
	res.status(err.status || 500).json({
		status: "fail",
		message: err.message || "An error occured while processing your request",
		stack: err.stack,
	});
};

module.exports = { URLnotFoundHandler, errorHandler };
