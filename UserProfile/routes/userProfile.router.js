const { Router } = require("express");
const {
	getconnected,
	user_profile_match,
	deleteProfileByID,
	GetUserProfileByID,
	GetBooksList,
	GetBookCategoryList,
	GetBookByID
} = require("../controller/userProfile.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const matchSchema = require("../schema/matchSchema.schema.js");
const authMiddleware = require("../middleware/auth.middleware.js");


const router = Router();
router.get("/match", authMiddleware, getconnected);
router.post("/match",authMiddleware,validateRequest(matchSchema),user_profile_match);
router.delete("/match",authMiddleware,validateRequest(matchSchema),deleteProfileByID);
router.get("/userinfo/:user_id_2",authMiddleware,GetUserProfileByID);
router.get("/books",authMiddleware,GetBooksList);
router.get("/books/:book_id",authMiddleware,GetBookByID);
router.get("/book-category",authMiddleware,GetBookCategoryList);

const signupFormRouter = router;
module.exports = signupFormRouter;
