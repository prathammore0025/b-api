const {
	getUsersSocket,
	getUserByIdSocket,
	updateUserByIdSocket,
} = require("../sockets/users.socket.js");

const getUser = async (req, res) => {
	try {
		const { search, limit, page } = req.query;

		const data = await getUsersSocket({ search, limit, page });

		res.json({
			status: "success",
			message: "Users retrieved successfully.",
			data,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const getUserById = async (req, res) => {
	try {
		const { user_id } = req.params;

		const user = await getUserByIdSocket({ user_id });

		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		if (user.is_deleted === true) {
			return res.status(404).json({
				status: "error",
				message: "User is deleted",
			});
		}

		res.json({
			status: "success",
			message: "Users retrieved successfully.",
			user,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const updateUserById = async (req, res) => {
	try {
		const { user_id } = req.params;

		const user = await getUserByIdSocket({ user_id });

		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		if (user.status === "error") {
			return res.status(404).json({
				status: "error",
				message: user.message || "Something went wrong",
			});
		}

		const updatedUser = await updateUserByIdSocket({
			user_id,
			req: req.body,
			updatedBy: req.requestor,
		});

		if (updatedUser.is_deleted) {
			return res.status(200).json({
				status: "success",
				message: "User deleted successfully",
			});
		}

		res.status(200).json({
			status: "success",
			message: "User updated successfully",
			updatedUser,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const deleteUserById = async (req, res) => {
	try {
		const { user_id } = req.params;

		const user = await getUserByIdSocket({ user_id });

		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		if (user.status === "error") {
			return res.status(404).json({
				status: "error",
				message: user.message || "Something went wrong",
			});
		}

		req.body = { ...user, is_deleted: true };

		await updateUserById(req, res);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

module.exports = { getUser, getUserById, updateUserById, deleteUserById };
