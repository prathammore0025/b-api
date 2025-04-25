const Joi = require("joi");

const forgotPasswordSchema = Joi.object({
	email: Joi.string().required(),
	deviceInfo: Joi.object({
		deviceId: Joi.string().required(),
		deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
		deviceName: Joi.string().required(),
		os: Joi.string().required(),
		appVersion: Joi.string().required(),
		countryname: Joi.string().required(),
	}).required(),
});

module.exports = forgotPasswordSchema;
