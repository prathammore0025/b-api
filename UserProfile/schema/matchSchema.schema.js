const Joi = require("joi");
const deviceInfoSchema = Joi.object({
	appVersion: Joi.string().required(),
	countryname: Joi.string().required(),
	deviceId: Joi.string().required(),
	deviceName: Joi.string().required(),
	deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
	os: Joi.string().required(),
}).unknown(true);

const matchSchema = Joi.object({
	user_id_2: Joi.string().required(),
	deviceInfo: deviceInfoSchema.optional(),
}).unknown(true);

module.exports = matchSchema;
