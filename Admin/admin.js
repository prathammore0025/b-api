const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const router = require("./routes/index.js");
const { URLnotFoundHandler, errorHandler } = require("./utils/errors.util.js");
const { startNotificationJob } = require("./cron/jobs/notification.job.js");
const { Server } = require("socket.io");
const http = require("http");
const formSocket = require("./sockets/form.socket.js");
const notificationSocket = require("./sockets/notification.socket.js");
dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", router);

formSocket(io);
notificationSocket(io);

app.use(URLnotFoundHandler);
app.use(errorHandler);

startNotificationJob();

const dbURI = process.env.DB_CONNECTION_STRING;

mongoose
	.connect(dbURI)
	.then(() => {
		console.log("MongoDB connected!");
		// app.listen(port, () => {
		// 	console.log(`Server started on: ${port} !!`);
		// });
		server.listen(port, () => {
			console.log(`Socket.IO & Express server running on: ${port} ✅`);
		});
	})
	.catch((err) => {
		console.error("Error", err);
	});
