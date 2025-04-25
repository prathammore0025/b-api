const { Router } = require("express");
const {
	getAllPlansHandler,
	addNewPlanHandler,
	getPlansByIDHandler,
	deletePlansByIDHandler,
	updatePlanByIDHandler,
} = require("../controller/subscriptions.controller.js");
const { validateRequest } = require("../middleware/validation.middleware.js");
const subscriptionSchema = require("../schema/subscription.schema.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = Router();

router.get("/plans", authMiddleware, getAllPlansHandler);
router.get("/plans/:subscription_id", authMiddleware, getPlansByIDHandler);
router.post(
	"/plans",
	authMiddleware,
	validateRequest(subscriptionSchema),
	addNewPlanHandler
);
router.put(
	"/plans/:subscription_id",
	authMiddleware,
	validateRequest(subscriptionSchema),
	updatePlanByIDHandler
);
router.delete(
	"/plans/:subscription_id",
	authMiddleware,
	deletePlansByIDHandler
);

const authRouter = router;
module.exports = authRouter;
