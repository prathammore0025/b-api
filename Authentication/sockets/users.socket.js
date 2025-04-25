const {
	getUserById,
	getUser,
	updateUserById,
} = require("../controller/users.controller.js");

const usersSocket = (io) => {
	io.on("connection", (socket) => {
		socket.on("request_authentication_users_all", async (request, callback) => {
			const usersData = await getUser({
				search: request.search,
				limit: request.limit,
				page: request.page,
			});
			callback(usersData);
		});

		socket.on(
			"request_authentication_users_by_id",
			async (request, callback) => {
				const usersData = await getUserById({ user_id: request.user_id });
				callback(usersData);
			}
		);

		socket.on(
			"request_authentication_users_update_by_id",
			async (request, callback) => {
				const usersData = await updateUserById({
					user_id: request.user_id,
					req: request.req,
					updatedBy: request.updatedBy,
				});
				callback(usersData);
			}
		);
	});

	return io;
};

module.exports = usersSocket;
