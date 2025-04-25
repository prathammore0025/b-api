const { io } = require("socket.io-client");

const getUsersSocket = async ({ search, limit, page }) => {
	return new Promise((resolve, reject) => {
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			socket.emit(
				"request_authentication_users_all2",
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


const CreateChatSocket = async ({ user_id, req, created_by }) => {
	return new Promise((resolve, reject) => {
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"chat_create",
				{ user_id, req, created_by },
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
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"check_user_status",
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

const getUsersAlldata = async () => {
	return new Promise((resolve, reject) => {
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"getUsersAllData",
				{},
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


const addChatData = async ({ user_id }) => {
	return new Promise((resolve, reject) => {
		const socket = io("http://localhost:8002", {
			autoConnect: true,
			reconnectionAttempts: 3,
		});

		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit(
				"check_user_status",
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

module.exports = { getUsersSocket, getUserByIdSocket, CreateChatSocket,getUsersAlldata,addChatData };
