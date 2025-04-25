require("dotenv").config();
const { io } = require("socket.io-client");

const AUTH_SOCKET = process.env.ADMIN_SOCKET;

const getNotificationsSocket = async (req) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			socket.emit("request_notification_all", req, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

const updateNotificationByIdSocket = async (req) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit("request_notification_seen_by_id", req, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

const deleteNotificationByIdSocket = async (req) => {
	return new Promise((resolve, reject) => {
		const socket = io(AUTH_SOCKET, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			socket.emit("request_delete_notification_by_id", req, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});

		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
	});
};

module.exports = {
	getNotificationsSocket,
	updateNotificationByIdSocket,
	deleteNotificationByIdSocket,
};
