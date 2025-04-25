require("dotenv").config();
const { io } = require("socket.io-client");
const AUTH_SOCKET = process.env.AUTH_SOCKET;

const getUsersSocket = async ({ search, limit, page }) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			socket.emit(
				"request_authentication_users_all",
				{ search, limit, page },
				(response) => {
					socket.disconnect();
					resolve(response);
				}
			);
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

const getUserByIdSocket = async ({ user_id }) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"request_authentication_users_by_id",
				{ user_id },
				(response) => {
					socket.disconnect();
					resolve(response);
				}
			);
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

const updateUserByIdSocket = async ({ user_id, req, updatedBy }) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"request_authentication_users_update_by_id",
				{ user_id, req, updatedBy },
				(response) => {
					socket.disconnect();
					resolve(response);
				}
			);
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

module.exports = { getUsersSocket, getUserByIdSocket, updateUserByIdSocket };
