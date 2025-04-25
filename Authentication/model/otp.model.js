const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OtpSchema = new mongoose.Schema(
	{
		otp_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		email: {
			type: String,
			required: true,
		},
		otp_code: {
			type: String,
			required: true,
		},
		purpose: {
			type: String,
			required: true,
			enum: ["mfa", "forgot_password"],
		},
		status: {
			type: String,
			enum: ["pending", "used", "expired"],
			default: "pending",
		},
		created_time: {
			type: Date,
			default: Date.now,
		},
		expire_time: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Otp", OtpSchema);
