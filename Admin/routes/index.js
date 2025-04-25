const { Router } = require("express");
const subscriptionRouter = require("./subscription.router.js");
const signupRouter = require("./signupForm.router.js");
const notificationRouter = require("./notification.router.js");
const usersRouter = require("./users.router.js");

const router = Router();

router.use("/v1/admin", signupRouter);
router.use("/v1/admin/notification", notificationRouter);
router.use("/v1/admin/subscriptions", subscriptionRouter);
router.use("/v1/admin/users", usersRouter);

router.get("/", (req, res) => {
	res.json({ status: "success", message: "Admin API is working!" });
});

module.exports = router;
