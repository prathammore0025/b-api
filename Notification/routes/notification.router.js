const { Router } = require("express");
const {
	getNotifications,
	seenNotifications,
	deleteNotifications,
} = require("../controller/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.get("/:notification_id/seen", authMiddleware, seenNotifications);
router.delete("/:notification_id", authMiddleware, deleteNotifications);

const notificationRouter = router;
module.exports = notificationRouter;
