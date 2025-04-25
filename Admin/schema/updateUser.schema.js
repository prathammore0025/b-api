const Joi = require("joi");

const updateUserSchema = Joi.object({
	email: Joi.string().required(),
	password_hash: Joi.string().required(),
	full_name: Joi.string().min(2).max(100).required(),
	profile_picture: Joi.string().required(),
	subscription_status: Joi.string()
		.valid("Active", "Expired", "Pending")
		.required(),
	mfa_enabled: Joi.boolean().required(),
	roles: Joi.array().items(Joi.string()).required(),
	country: Joi.string().min(2).max(50).required(),
	is_active: Joi.boolean().required(),
	is_deleted: Joi.boolean().required(),
});

module.exports = updateUserSchema;
