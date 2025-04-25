const Joi = require("joi");

const loginSchema = Joi.object({
	email: Joi.string().required(),
	password: Joi.string().min(6).required(),
	deviceInfo: Joi.object({
		deviceId: Joi.string().required(),
		deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
		deviceName: Joi.string().required(),
		os: Joi.string().required(),
		appVersion: Joi.string().required(),
		countryname: Joi.string().required(),
	}).required(),
});

module.exports = loginSchema;
