const { Router } = require("express");
const ChatRouter = require("./chat_communication.router.js");

const router = Router();
router.use("/v1/chat-communication", ChatRouter);

router.get("/", (req, res) => {
    res.json({ status: "success", message: "Chat API is working!" });
});

module.exports = router;
