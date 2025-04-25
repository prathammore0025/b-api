const Joi = require("joi");

const notificationSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	schedule_time: Joi.string().required(),
}).unknown(true);

module.exports = notificationSchema;
