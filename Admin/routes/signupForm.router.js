const { Router } = require("express");
const {
	getSignUpForms,
	postFormBySlugHandler,
	updateSignUpFormById,
	deleteFormByFormId,
	GetByIDFormBySlugHandler,
	GetFormIDWiseForm,
	GetBySlug,
	GetFormIDWiseRecord,
	// GetBySlugForm,
} = require("../controller/signupForm.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const formSchema = require("../schema/formBySlug.schema.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = Router();

router.get("/http/get-signup-form", authMiddleware, getSignUpForms);
router.get(
	"/http/get-signup-form/:slug",
	authMiddleware,
	GetByIDFormBySlugHandler
);
router.get("/http/get-form-by-id/:form_id", authMiddleware, GetFormIDWiseForm);
router.post(
	"/http/signup-form",
	authMiddleware,
	validateRequest(formSchema),
	postFormBySlugHandler
);
router.put(
	"/http/update-signup-form/:form_id",
	authMiddleware,
	validateRequest(formSchema),
	updateSignUpFormById
);
router.delete(
	"/http/delete-signup-form/:form_id",
	authMiddleware,
	deleteFormByFormId
);

router.get("/http/get-signup-form-slug/:slug", GetBySlug);

router.get("/http/signup-form/:slug", GetBySlug);

router.get("/http/get-formid-wise-record/:form_id", GetFormIDWiseRecord);

const signupFormRouter = router;
module.exports = signupFormRouter;
