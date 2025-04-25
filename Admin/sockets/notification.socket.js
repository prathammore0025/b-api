const {
	getNotification,
	updateNotificationById,
	deleteNotificationById,
} = require("../controller/notification.controller");

const notificationSocket = (io) => {
	io.on("connection", (socket) => {
		socket.on("request_notification_all", async (request, callback) => {
			const { req } = request;
			const notificationData = await getNotification(req);
			callback(notificationData);
		});

		socket.on("request_notification_seen_by_id", async (request, callback) => {
			const { req } = request;
			const notificationData = await updateNotificationById(req);
			callback(notificationData);
		});

		socket.on(
			"request_delete_notification_by_id",
			async (request, callback) => {
				const { req } = request;
				const notificationData = await deleteNotificationById(req);
				callback(notificationData);
			}
		);
	});

	return io;
};

module.exports = notificationSocket;
