const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		userinfo_id: {
			type: String,
			default: uuidv4
		},
		form_id: {
			type: String,
			required: true,
		},
		user_id: {
			type: String,
			required: true,
		},
		
		data: {
			type: [String], // Array of strings
			default: [],
			required: true,
		},
		
		is_deleted: {
			type: Boolean,
			default: false,
			comment: "0-NoDeleted, 1-Deleted",
		},
		submittedAt: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

const UsersInfo = mongoose.model("user_info", userSchema);

module.exports = UsersInfo;
