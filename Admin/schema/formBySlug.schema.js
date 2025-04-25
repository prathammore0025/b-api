const Joi = require("joi");

const validInputTypes = [
	"text",
	"password",
	"checkbox",
	"radio",
	"datetime-local",
	"dropdown",
];

const validationSchema = Joi.object({
	minlength: Joi.when(Joi.ref("type"), {
		is: Joi.valid("text", "password"),
		then: Joi.number().min(1),
		otherwise: Joi.forbidden(),
	}),
	maxlength: Joi.when(Joi.ref("type"), {
		is: Joi.valid("text", "password"),
		then: Joi.number().min(Joi.ref("minlength")),
		otherwise: Joi.forbidden(),
	}),
	min: Joi.when(Joi.ref("type"), {
		is: Joi.valid("datetime-local"),
		then: Joi.number(),
		otherwise: Joi.forbidden(),
	}),
	max: Joi.when(Joi.ref("type"), {
		is: Joi.valid("datetime-local"),
		then: Joi.number(),
		otherwise: Joi.forbidden(),
	}),
	pattern: Joi.when(Joi.ref("type"), {
		is: Joi.valid("text"),
		then: Joi.string().regex(/.*/),
		otherwise: Joi.forbidden(),
	}),
	defaultChecked: Joi.when(Joi.ref("type"), {
		is: Joi.valid("checkbox"),
		then: Joi.boolean(),
		otherwise: Joi.forbidden(),
	}),
	defaultValue: Joi.when(Joi.ref("type"), {
		is: Joi.valid("text", "password"),
		then: Joi.alternatives().try(Joi.string(), Joi.number()),
		otherwise: Joi.forbidden(),
	}),
}).unknown(true);

const optionsSchema = Joi.array()
	.items(
		Joi.object({
			value: Joi.string().required(),
		})
	)
	.min(1);

const fieldSchema = Joi.object({
	name: Joi.string().required(),
	type: Joi.string()
		.valid(...validInputTypes)
		.required(),
	label: Joi.string().required(),
	placeholder: Joi.string().optional(),
	required: Joi.boolean().required(),
	validation: Joi.when("type", {
		is: "dropdown",
		then: Joi.forbidden(),
		otherwise: validationSchema,
	}),
	options: Joi.when("type", {
		is: Joi.valid("dropdown", "radio"),
		then: optionsSchema.required(),
		otherwise: Joi.forbidden(),
	}),
}).unknown(true);

const stepSchema = Joi.object({
	step: Joi.number().required(),
	title: Joi.string().required(),
	previous_button_text: Joi.string().when("step", {
		is: 1,
		then: Joi.forbidden(),
		otherwise: Joi.required(),
	}),
	next_button_text: Joi.string().required(),
	fields: Joi.array().items(fieldSchema).min(1).required(),
}).unknown(true);

const formSchema = Joi.object({
	slug: Joi.string().required(),
	name: Joi.string().required(),
	step: Joi.array().items(stepSchema).min(1).required(),
	is_active: Joi.boolean().optional(),
	subscription_id: Joi.array().items(Joi.string().uuid()).min(1).optional(),
}).unknown(true);

module.exports = formSchema;
