const { Router } = require("express");
const subscriptionRouter = require("./subscription.router.js");

const router = Router();

router.use("/v1/subscriptions", subscriptionRouter);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Subscription endpoint' });
});

module.exports = router;
