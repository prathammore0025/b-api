const { Router } = require("express");
const {
	getUser,
	getUserById,
	updateUserById,
	deleteUserById,
} = require("../controller/users.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const updateUserSchema = require("../schema/updateUser.schema.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = Router();

router.get("/", authMiddleware, getUser);
router.get("/:user_id", authMiddleware, getUserById);
router.put(
	"/:user_id",
	authMiddleware,
	validateRequest(updateUserSchema),
	updateUserById
);
router.delete("/:user_id", authMiddleware, deleteUserById);

const usersRouter = router;
module.exports = usersRouter;
