const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const DecrypteduserSchema = new mongoose.Schema(
	{
		decrypted_user_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		user_id: {
			type: String,
			default: uuidv4,
			unique: true,
			ref: "User",
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
	{ timestamps: true }
);

const UserDecrypt = mongoose.model("DecryptedUser", DecrypteduserSchema);

module.exports = UserDecrypt;
