const { Router } = require("express");
const {
	getChatList,
	getChatDetail,
	create_chat,
	create_video
	// getconnected,
	// updateSignUpFormById,
	// deleteProfileByID,
	// GetByIDFormBySlugHandler,
	// GetFormIDWiseForm,
	// GetUserProfileByID,
	// GetFormIDWiseRecord,
	// GetUserProfileByIDForm,
} = require("../controller/chat_communication.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const formSchema = require("../schema/formBySlug.schema.js");
const updateFormSchema = require("../schema/updateFormBySlug.schema.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = Router();

router.get("/chat",authMiddleware,getChatList);
router.get("/chat/:id",authMiddleware,getChatDetail);
router.post("/chat",authMiddleware,create_chat
	// validateRequest(formSchema),
);
router.post("/video",
	authMiddleware,create_video
	// validateRequest(formSchema),
);

// router.get("/match", authMiddleware, getconnected);


// router.get(
// 	"/match/:user_id_2",authMiddleware,
// 	GetUserProfileByID
// );

// router.delete(
// 	"/http/match/:user_id_2",
// 	authMiddleware,
// 	deleteProfileByID
// );


// router.get(
// 	"/http/get-signup-form/:slug",
// 	authMiddleware,
// 	GetByIDFormBySlugHandler
// );
// router.get("/http/get-form-by-id/:form_id", authMiddleware, GetFormIDWiseForm);

// router.put(
// 	"/http/update-signup-form/:form_id",
// 	authMiddleware,
// 	// validateRequest(updateFormSchema),
// 	updateSignUpFormById
// );


// router.get(
// 	"/http/get-signup-form-slug/:slug",
// 	GetUserProfileByID
// );

// router.get("/http/get-formid-wise-record/:form_id", GetFormIDWiseRecord);

const signupFormRouter = router;
module.exports = signupFormRouter;
