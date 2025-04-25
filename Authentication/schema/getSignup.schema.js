const Joi = require("joi");
const getSignupSchema = Joi.object({
    deviceInfo: Joi.object({
        deviceId: Joi.string().required(),
        deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
        deviceName: Joi.string().required(),
        os: Joi.string().required(),
        appVersion: Joi.string().required(),
        countryname: Joi.string().required(),
    }).required(),
});

module.exports = getSignupSchema;
