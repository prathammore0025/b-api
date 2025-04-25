const { io } = require("socket.io-client");

const getAuthenticationData = async ({ user_id }) => {
	return new Promise((resolve, reject) => {
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit("request_authentication_users", { user_id }, (response) => {
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

module.exports = { getAuthenticationData };
