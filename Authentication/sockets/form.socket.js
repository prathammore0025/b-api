const { io } = require("socket.io-client");
const getFormSocket = async ({ slug }) => {
	return new Promise((resolve, reject) => {
		const socket = io(process.env.AdminURL, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit("slug_wise_form", { slug }, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});
		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
		socket.on("connect", () => {
			console.log("✅ 8002 Connected to 8001:", socket.id);
		});

		socket.on("connect_error", (err) => {
			console.error("❌ 8002 Failed to connect to 8001:", err);
		});
	});
};

const getDefaultFormSocket = async () => {
	return new Promise((resolve, reject) => {
		const socket = io(process.env.AdminURL, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit("get_default_form", {}, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});
		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
		socket.on("connect", () => {
			console.log("✅ 8002 Connected to 8001:", socket.id);
		});

		socket.on("connect_error", (err) => {
			console.error("❌ 8002 Failed to connect to 8001:", err);
		});
	});
};

const getFormByFormIDSocket = async ({ form_id }) => {
	return new Promise((resolve, reject) => {
		const socket = io(process.env.AdminURL, {
			autoConnect: true,
			reconnectionAttempts: 3,
		});
		socket.on("connect", () => {
			// here add emit region vie as well
			socket.emit("form_id_wise_form", { form_id }, (response) => {
				socket.disconnect();
				resolve(response);
			});
		});
		socket.on("connect_error", (err) => {
			console.error("Connection Error:", err.message);
			reject(err);
		});
		socket.on("connect", () => {
			console.log("✅ 8002 Connected to 8001:", socket.id);
		});

		socket.on("connect_error", (err) => {
			console.error("❌ 8002 Failed to connect to 8001:", err);
		});
	});
};
module.exports = { getFormSocket, getDefaultFormSocket, getFormByFormIDSocket };
