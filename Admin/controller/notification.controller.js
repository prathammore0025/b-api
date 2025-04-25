const { default: mongoose } = require("mongoose");
const Notification = require("../model/notification.model.js");
const NotificationHistory = require("../model/notificationHistory.model.js");

const getNotification = async (req, res) => {
	try {
		const search = req.query?.search;
		const page = parseInt(req.query?.page, 10) || 1;
		const limit = parseInt(req.query?.limit, 10) || 10;

		const skip = (page - 1) * limit;
		let query = {};

		if (typeof search === "string") {
			if (/[^a-zA-Z0-9 ]/.test(search)) {
				const response = {
					status: "error",
					message: "Search cannot contain special characters",
				};
				return res ? res.json(response) : response;
			}

			if (search.trim() !== "") {
				query.title = { $regex: new RegExp(search, "i") };
			}
		}

		const notification = await Notification.find({
			...query,
			is_deleted: false,
		})
			.skip(skip)
			.limit(limit);

		const totalRecords = await Notification.countDocuments({
			...query,
			is_deleted: false,
		});

		const totalPages = Math.ceil(totalRecords / limit);

		const response = {
			status: "success",
			message: "Notification retrieved successfully.",
			data: {
				current_page: page,
				total_pages: totalPages,
				total_records: totalRecords,
				notification: notification.map((item) => ({
					notification_id: item.notification_id,
					title: item.title,
					body: item.body,
					schedule_time: item.schedule_time,
				})),
			},
		};

		return res ? res.json(response) : response;
	} catch (error) {
		console.error("Error:", error);
		const errorResponse = {
			status: "error",
			message: "Internal server error",
		};
		return res ? res.status(500).json(errorResponse) : errorResponse;
	}
};

const getNotificationById = async (req, res) => {
	try {
		const { notification_id } = req.params;

		const notification = await Notification.findOne({ notification_id });

		if (!notification) {
			const response = {
				status: "error",
				message: "Notification not found",
			};
			return res ? res.status(404).json(response) : response;
		}

		if (notification.is_deleted === true) {
			const response = {
				status: "error",
				message: "Notification is deleted",
			};
			return res ? res.status(404).json(response) : response;
		}

		const response = {
			status: "success",
			message: "Notification retrieved successfully.",
			data: {
				notification_id: notification.notification_id,
				title: notification.title,
				body: notification.body,
				schedule_time: notification.schedule_time,
			},
		};

		return res ? res.json(response) : response;
	} catch (error) {
		console.error("Error:", error);
		const errorResponse = {
			status: "error",
			message: "Internal server error",
		};
		return res ? res.status(500).json(errorResponse) : errorResponse;
	}
};

const postNotification = async (req, res) => {
	try {
		const { title, body, schedule_time, file_url } = req.body;

		const data = await Notification.create({
			title,
			body,
			schedule_time,
			image: file_url,
			created_by: req.requestor.user_id,
			updated_by: req.requestor.user_id,
		});

		return res.status(200).json({
			status: "success",
			message: "Notification created successfully",
			data: {
				notification_id: data.notification_id,
				title: data.title,
				body: data.body,
				schedule_time: data.schedule_time,
				image: file_url,
			},
		});
	} catch (error) {
		console.error("Error:", error);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};

const updateNotificationById = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { notification_id } = req.params;

		const notification = await Notification.findOne({
			notification_id,
		}).session(session);

		if (!notification) {
			const response = {
				status: "error",
				message: "Notification not found",
			};
			await session.abortTransaction();
			session.endSession();
			return res ? res.status(404).json(response) : response;
		}

		if (notification.is_deleted) {
			const response = {
				status: "error",
				message: "Notification is deleted",
			};
			await session.abortTransaction();
			session.endSession();
			return res ? res.status(404).json(response) : response;
		}

		await NotificationHistory.create(
			[
				{
					notification_id: notification.notification_id,
					title: notification.title,
					body: notification.body,
					image: notification.image,
					schedule_time: notification.schedule_time,
					created_by: req.requestor.user_id,
					updated_by: req.requestor.user_id,
				},
			],
			{ session }
		);

		const updatedNotification = await Notification.findOneAndUpdate(
			{ notification_id },
			{
				...req.body,
				updated_by: req.requestor.user_id,
			},
			{ new: true, session }
		);

		await session.commitTransaction();
		session.endSession();

		const response = req.body.is_deleted
			? {
					status: "success",
					message: "Notification deleted successfully.",
			  }
			: {
					status: "success",
					message: "Notification updated successfully",
					data: {
						notification_id: updatedNotification.notification_id,
						title: updatedNotification.title,
						body: updatedNotification.body,
						image: updatedNotification.image,
						schedule_time: updatedNotification.schedule_time,
					},
			  };

		return res ? res.json(response) : response;
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error:", error);
		const errorResponse = {
			status: "error",
			message: "Internal server error",
		};
		return res ? res.status(500).json(errorResponse) : errorResponse;
	}
};

const deleteNotificationById = async (req, res) => {
	try {
		req.body = { is_deleted: true };
		return await updateNotificationById(req, res);
	} catch (error) {
		console.error("Error:", error);
		const errorResponse = {
			status: "error",
			message: "Internal server error",
		};
		return res ? res.status(500).json(errorResponse) : errorResponse;
	}
};

module.exports = {
	getNotification,
	getNotificationById,
	postNotification,
	updateNotificationById,
	deleteNotificationById,
};
