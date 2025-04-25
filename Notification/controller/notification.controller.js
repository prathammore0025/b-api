const {
	getNotificationsSocket,
	updateNotificationByIdSocket,
	deleteNotificationByIdSocket,
} = require("../sockets/notification.socket.js");

const getNotifications = async (req, res) => {
	try {
		const { body, query, params, headers, requestor } = req;
		const cleanReq = {
			body,
			query,
			params,
			requestor,
			headers: {
				authorization: headers.authorization,
			},
		};

		const notification = await getNotificationsSocket({
			req: cleanReq,
		});

		res.json({ ...notification });
	} catch (error) {
		console.log("Error : ", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const seenNotifications = async (req, res) => {
	try {
		const { body, query, params, headers, requestor } = req;
		const cleanReq = {
			body,
			query,
			params,
			requestor,
			headers: {
				authorization: headers.authorization,
			},
		};
		const notification = await updateNotificationByIdSocket({
			req: cleanReq,
		});
		res.json({ ...notification });
	} catch (error) {
		console.log("Error : ", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const deleteNotifications = async (req, res) => {
	try {
		const { body, query, params, headers, requestor } = req;
		const cleanReq = {
			body,
			query,
			params,
			requestor,
			headers: {
				authorization: headers.authorization,
			},
		};
		const notification = await deleteNotificationByIdSocket({
			req: cleanReq,
		});
		res.json({ ...notification });
	} catch (error) {
		console.log("Error : ", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

module.exports = { getNotifications, seenNotifications, deleteNotifications };
