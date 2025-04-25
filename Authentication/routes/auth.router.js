const { Router } = require("express");
const {
	loginHandler,
	verifyOtpHandler,
	forgotPasswordHandler,
	resetPasswordHandler,
	getsignupform,
	signup_form_default,
	signup_form,
	signup_form_register
} = require("../controller/auth.controller.js");

const {
	checksplash,
} = require("../controller/maintenance_version.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const loginSchema = require("../schema/login.schema.js");
const otpSchema = require("../schema/otp.schema.js");
const forgotPasswordSchema = require("../schema/forgotPassword.schema.js");
const resetPasswordSchema = require("../schema/resetPassword.schema.js");
const versionSchema = require("../schema/version.schema.js");
const getSignupSchema = require("../schema/getSignup.schema.js");
const SignupSchema = require("../schema/Signup.schema.js");
const RegistrationSchema = require("../schema/registration.schema.js")

const {
	checkEncrypted,
} = require("../middleware/encryptedCheck.middleware.js");

const router = Router();

router.post(
	"/login",
	validateRequest(loginSchema),
	checkEncrypted(),
	loginHandler
);
router.post(
	"/verify-otp",
	validateRequest(otpSchema),
	checkEncrypted(),
	verifyOtpHandler
);
router.post("/splash/check",validateRequest(versionSchema), checksplash);
// router.post("/version-check", versionCheck);
router.post(
	"/forgot-password",
	validateRequest(forgotPasswordSchema),
	checkEncrypted(),
	forgotPasswordHandler
);
router.post(
	"/reset-password",
	validateRequest(resetPasswordSchema),
	checkEncrypted(),
	resetPasswordHandler
);

router.post("/signup-form/:slug", validateRequest(getSignupSchema),getsignupform);
router.get("/signup-form", validateRequest(SignupSchema),signup_form);

router.post("/signup-form-default", validateRequest(getSignupSchema),signup_form_default);
router.post("/signup-form-register", validateRequest(RegistrationSchema),signup_form_register);
const authRouter = router;
module.exports = authRouter;
