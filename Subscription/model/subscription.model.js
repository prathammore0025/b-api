const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const subscriptionSchema = new mongoose.Schema(
	{
		subscription_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		user_subscription_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		user_id: {
			type: String,
			default: uuidv4, // remove this latter
			required: false,
		},
		stripe_transaction_id: {
			type: String,
			default: uuidv4, // remove this latter
			required: false,
		},
		amount: {
			type: Number,
			default: 0,
		},
		subscription_status: {
			type: String,
			required: false,
			enum: ["Active", "Expired", "Pending"],
		},
		created_by: {
			type: String,
			required: true,
		},
		updated_by: {
			type: String,
			required: true,
		},
		endtime: {
			type: Date,
			required: false,
		},
		isactive: {
			type: Boolean,
			required: true,
		},
		plan: {
			type: String,
			required: true,
		},
		plan_name: {
			type: String,
			required: true,
		},
		remarks: {
			type: String,
			required: false,
		},
		starttime: {
			type: Date,
			required: true,
		},
		term: {
			type: Number,
			required: true,
		},
		is_deleted: {
			type: Boolean,
			default: false,
			comment: "0-NoDeleted, 1-Deleted",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
