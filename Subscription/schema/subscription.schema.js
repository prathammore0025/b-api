const Joi = require("joi");

const deviceInfoSchema = Joi.object({
	appVersion: Joi.string().required(),
	countryname: Joi.string().required(),
	deviceId: Joi.string().required(),
	deviceName: Joi.string().required(),
	deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
	os: Joi.string().required(),
}).unknown(true);

const subscriptionSchema = Joi.object({
	plan_name: Joi.string().required(),
	plan: Joi.string().required(),
	term: Joi.number().required(),
	amount: Joi.string()
		.pattern(/^\d{1,6}\.\d{1,2}$/)
		.required(),
	remarks: Joi.string().optional(),
	isactive: Joi.string().required(),
	starttime: Joi.date().required(),
	endtime: Joi.date().required(),
	deviceInfo: deviceInfoSchema.optional(),
}).unknown(true);

module.exports = subscriptionSchema;
