const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { Schema } = mongoose;

const MaintenanceSchema = new Schema(
	{
		maintenance_id: {
			type: String,
			default: uuidv4,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		start_time: {
			type: Date,
			required: true,
		},
		end_time: {
			type: Date,
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
	},
	{
		timestamps: true,
	}
);

const Maintenance = mongoose.model("maintenance", MaintenanceSchema);

module.exports = Maintenance;
