const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");


const userProfileHistorySchema = new mongoose.Schema(
	{
		matched_history_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		matched_id: {
			type: String,
			required: true,
		},
		user_id_1: {
			type: String,
			required: true,
		},
		user_id_2: {
			type: String,
			required: true,
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

module.exports = mongoose.model("userProfileHistory", userProfileHistorySchema);
