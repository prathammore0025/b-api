const Joi = require("joi");
const SignupSchema = Joi.object({
    form_id: Joi.string().required(),
    form_data: Joi.array().items(
        Joi.object().unknown(true)
    ).required(),
    deviceInfo: Joi.object({
        deviceId: Joi.string().required(),
        deviceType: Joi.string().valid("mobile", "desktop", "tablet").required(),
        deviceName: Joi.string().required(),
        os: Joi.string().required(),
        appVersion: Joi.string().required(),
        countryname: Joi.string().required(),
    }).required(),
});
module.exports = SignupSchema;
