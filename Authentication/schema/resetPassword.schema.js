const Joi = require("joi");
require("dotenv").config();

const OTP_SIZE = process.env.OTP_SIZE ? Number(process.env.OTP_SIZE) : 6;

const resetPasswordSchema = Joi.object({
	email: Joi.string().required(),
	otp: Joi.string()
		.pattern(new RegExp(`^\\d{${OTP_SIZE}}$`))
		.required()
		.messages({
			"string.pattern.base": `OTP needs to be ${OTP_SIZE} digits long`,
		}),
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

module.exports = resetPasswordSchema;
