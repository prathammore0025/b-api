const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const notificationHistorySchema = new mongoose.Schema(
	{
		notification_history_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		notification_id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
		schedule_time: {
			type: Date,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		created_by: {
			type: String,
			required: true,
		},
		updated_by: {
			type: String,
			required: true,
		},
		is_deleted: {
			type: Boolean,
			default: false,
			required: true,
			comment: "0-NoDeleted, 1-Deleted",
		},
		is_active: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model(
	"NotificationHistory",
	notificationHistorySchema
);
