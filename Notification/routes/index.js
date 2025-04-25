const { Router } = require("express");
const notificationRouter = require("./notification.router");

const router = Router();
router.use("/v1/notification", notificationRouter);

router.get("/", (req, res) => {
	res.json({ status: "success", message: "Notification API is working!" });
});

module.exports = router;
