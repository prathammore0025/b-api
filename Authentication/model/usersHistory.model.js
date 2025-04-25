const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { Schema } = mongoose;

const userHistorySchema = new Schema(
	{
		user_history_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		user_id: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			comment: "must be encrypted",
		},
		password_hash: {
			type: String,
			required: true,
			comment: "must be encrypted",
		},
		full_name: {
			type: String,
			required: true,
		},
		profile_picture: {
			type: String,
			required: false,
		},
		subscription_status: {
			type: String,
			required: false,
			comment: "Active, Expired, Pending",
		},
		mfa_enabled: {
			type: Boolean,
			required: true,
			default: false,
		},
		roles: {
			type: [String], // Array of strings
			default: [],
			required: true,
		},
		country: {
			type: String, // Array of strings
			default: [],
			required: true,
		},
		is_active: {
			type: Boolean,
			default: true,
			comment: "0-Inactive, 1-Active",
		},
		is_deleted: {
			type: Boolean,
			default: false,
			comment: "0-NoDeleted, 1-Deleted",
		},
		created_by: {
			type: String,
			required: false,
		},
		updated_by: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

const UserHistory = mongoose.model("UserHistory", userHistorySchema);

module.exports = UserHistory;
