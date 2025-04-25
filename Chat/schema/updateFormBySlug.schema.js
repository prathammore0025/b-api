// This file is not used

const Joi = require("joi");

const validationSchema = Joi.object({
	minlength: Joi.number().min(1),
	maxlength: Joi.number().min(Joi.ref("minlength")),
}).optional();

const fieldSchema = Joi.object({
	name: Joi.string(),
	type: Joi.string(),
	label: Joi.string(),
	placeholder: Joi.string(),
	required: Joi.boolean(),
	validation: validationSchema,
})
	.or("name", "type", "label", "placeholder", "required", "validation")
	.unknown(true);

const stepSchema = Joi.object({
	step: Joi.number(),
	title: Joi.string(),
	previous_button_text: Joi.string(),
	next_button_text: Joi.string(),
	fields: Joi.array().items(fieldSchema).min(1),
})
	.or("step", "title", "previous_button_text", "next_button_text", "fields")
	.unknown(true);

const updateFormSchema = Joi.object({
	name: Joi.string(),
	step: Joi.array().items(stepSchema).min(1),
	is_active: Joi.boolean(),
})
	.or("step", "is_active", "name")
	.unknown(true);

module.exports = updateFormSchema;
