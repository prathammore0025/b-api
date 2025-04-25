const { getUserById } = require("../controller/users.controller.js");

const authSocket = (io) => {
	io.on("connection", (socket) => {
		// add different regions
		socket.on("request_authentication_users", async (request, callback) => {
			const responseData = await getUserById({ user_id: request.user_id });
			callback(responseData);
		});
	});

	return io;
};

module.exports = authSocket;
