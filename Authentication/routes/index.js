const { Router } = require("express");
const authRouter = require("./auth.router.js");

const router = Router();

router.use("/v1/auth", authRouter);

router.get("/", (req, res) => {
	res.json({ status: "success", message: "Authentication API is working!" });
});

module.exports = router;
