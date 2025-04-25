const { Router } = require("express");
const UserProfileRouter = require("./userProfile.router.js");

const router = Router();
router.use("/v1/profile", UserProfileRouter);

router.get("/", (req, res) => {
    res.json({ status: "success", message: "User Profile API is working!" });
});

module.exports = router;
