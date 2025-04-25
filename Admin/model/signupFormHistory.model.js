const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const validInputTypes = [
	"text",
	"email",
	"password",
	"number",
	"tel",
	"url",
	"checkbox",
	"radio",
	"date",
	"time",
	"datetime-local",
	"file",
	"color",
	"dropdown",
];

// Validation Schema for different input types
const validationSchema = new mongoose.Schema(
	{
		minlength: { type: Number, required: false },
		maxlength: { type: Number, required: false },
		min: { type: Number, required: false },
		max: { type: Number, required: false },
		pattern: { type: String, required: false },
		defaultChecked: { type: Boolean, required: false },
		defaultValue: { type: mongoose.Schema.Types.Mixed, required: false },
	},
	{ _id: false }
);

// Dropdown Options Schema
const optionsSchema = new mongoose.Schema(
	{
		value: { type: String, required: true },
	},
	{ _id: false }
);

const fieldSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		type: { type: String, required: true, enum: validInputTypes },
		label: { type: String, required: true },
		placeholder: { type: String, required: false },
		required: { type: Boolean, required: true },
		validation: {
			type: validationSchema,
			required: function () {
				return this.type !== "dropdown" && this.type !== "radio";
			},
		},
		options: {
			type: [optionsSchema],
			required: function () {
				return this.type === "dropdown" && this.type === "radio";
			},
		},
	},
	{ _id: false }
);

const stepSchema = new mongoose.Schema(
	{
		step: { type: Number, required: true },
		title: { type: String, required: true },
		previous_button_text: {
			type: String,
			required: function () {
				return this.step !== 1; // Not required for step 1
			},
		},
		next_button_text: { type: String, required: true },
		fields: { type: [fieldSchema], required: true },
	},
	{ _id: false }
);

const signupFormHistorySchema = new mongoose.Schema(
	{
		form_history_id: {
			type: String,
			default: uuidv4,
			unique: true,
		},
		form_id: {
			type: String,
			required: true,
		},
		subscription_id: {
			type: [String],
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		step: [stepSchema],
		is_deleted: {
			type: Boolean,
			default: true,
			required: true,
			comment: "0-NoDeleted, 1-Deleted",
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		created_by: {
			type: String,
			required: false,
		},
		createdAt: {
			type: String,
			required: false,
		},
		updated_by: {
			type: String,
			required: false,
		},
		updatedAt: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("SignupFormHistory", signupFormHistorySchema);
