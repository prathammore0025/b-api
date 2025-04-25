const Joi = require("joi");

const deviceInfoSchema = Joi.object({
	appVersion: Joi.string().required(),
	countryname: Joi.string().required(),
	deviceId: Joi.string().required(),
	deviceName: Joi.string().required(),
	deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
	os: Joi.string().required(),
}).unknown(true);

// Ensure at least one field is present
const subscriptionHistorySchema = Joi.object({
	plan_name: Joi.string(),
	plan: Joi.string(),
	term: Joi.number(),
	amount: Joi.string().pattern(/^\d{1,6}\.\d{1,2}$/),
	remarks: Joi.string(),
	isactive: Joi.string(),
	starttime: Joi.date(),
	endtime: Joi.date(),
	deviceInfo: deviceInfoSchema.optional(),
})
	.or("plan_name", "plan", "term", "amount", "isactive", "starttime", "endtime")
	.unknown(true);

module.exports = subscriptionHistorySchema;
