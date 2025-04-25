const Joi = require("joi");

const validationSchema = Joi.object({
	minlength: Joi.number().min(1),
	maxlength: Joi.number().min(Joi.ref("minlength")),
}).optional();

const fieldSchema = Joi.object({
	name: Joi.string().required(),
	type: Joi.string().required(),
	label: Joi.string().required(),
	placeholder: Joi.string().required(),
	required: Joi.boolean().required(),
	validation: validationSchema,
}).unknown(true);

const stepSchema = Joi.object({
	step: Joi.number().required(),
	title: Joi.string().required(),
	previous_button_text: Joi.string().required(),
	next_button_text: Joi.string().required(),
	fields: Joi.array().items(fieldSchema).min(1).required(),
}).unknown(true);

const formSchema = Joi.object({
	slug: Joi.string().required(),
	name: Joi.string().required(),
	step: Joi.array().items(stepSchema).min(1).required(),
}).unknown(true);

module.exports = formSchema;
