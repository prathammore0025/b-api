const { Router } = require("express");
const {
	getAllPlansHandler,
	addNewPlanHandler,
	getPlansByIDHandler,
	deletePlansByIDHandler,
	updatePlanByIDHandler,
} = require("../controller/subscriptions.controller.js");
const { validateRequest } = require("../middleware/validation.middlerware.js");
const subscriptionSchema = require("../schema/subscription.schema.js");
const subscriptionHistorySchema = require("../schema/updateSubscription.schema.js");
const authMiddleware = require("../middleware/auth.middlerware.js");

const router = Router();

router.get("/plans", authMiddleware, getAllPlansHandler);
router.get("/plans/:subscription_id", authMiddleware, getPlansByIDHandler);
router.post(
	"/plans",
	validateRequest(subscriptionSchema),
	authMiddleware,
	addNewPlanHandler
);
router.put(
	"/plans/:subscription_id",
	validateRequest(subscriptionHistorySchema),
	authMiddleware,
	updatePlanByIDHandler
);
router.delete(
	"/plans/:subscription_id",
	authMiddleware,
	deletePlansByIDHandler
);

const authRouter = router;
module.exports = authRouter;
