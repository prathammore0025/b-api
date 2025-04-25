const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const messagesSchema = new mongoose.Schema(
	{
		messages: {
			type: String,
			default: uuidv4,
			unique: true,
			required: true,
		},
		sender_id: {
			type: String,
			required: true,
		},
		receiver_id: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		message_type: {
			type: String,
			required: true,
			comment: "text,image,video,files",
		},
		is_seen: {
			type: String,
		},
		seen_time: {
			type: Date,
		},
		is_active: {
			type: Boolean,
			default: true,
			required: true,
		},
		is_deleted: {
			type: Boolean,
			default: false,
			required: true,
			comment: "0-NoDeleted, 1-Deleted",
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model("messages", messagesSchema);
