const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const subscriptionSchema = new mongoose.Schema(
	{
		subscription_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		plan_name: {
			type: String,
			required: true,
		},
		plan: {
			type: String,
			required: true,
			enum: ["day", "month", "year"],
		},
		term: {
			type: Number,
			required: true,
		},
		amount: {
			type: Number,
			default: 0,
			required: true,
		},
		isactive: {
			type: Boolean,
			default: true,
			required: true,
		},
		starttime: {
			type: Date,
			required: true,
		},
		endtime: {
			type: Date,
			required: true,
		},
		remarks: {
			type: String,
			required: false,
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
		is_default: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
