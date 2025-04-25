const { Router } = require("express");
const {
	getNotification,
	getNotificationById,
	postNotification,
	updateNotificationById,
	deleteNotificationById,
} = require("../controller/notification.controller");
const { validateRequest } = require("../middleware/validation.middleware");
const notificationSchema = require("../schema/notification.schema");
const authMiddleware = require("../middleware/auth.middleware");
const fileUploadMiddleware = require("../middleware/fileupload.middleware");

const router = Router();

router.get("/", authMiddleware, getNotification);
router.get("/:notification_id", authMiddleware, getNotificationById);
router.post(
	"/",
	authMiddleware,
	fileUploadMiddleware(["jpeg", "jpg", "png"]),
	validateRequest(notificationSchema),
	postNotification
);
router.put(
	"/:notification_id",
	authMiddleware,
	validateRequest(notificationSchema),
	updateNotificationById
);
router.delete("/:notification_id", authMiddleware, deleteNotificationById);

const notificationRouter = router;
module.exports = notificationRouter;
