const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const router = require("./routes/index.js");
const { URLnotFoundHandler, errorHandler } = require("./utils/errors.util.js");
const authSocket = require("./sockets/auth.socket.js");
const usersSocket = require("./sockets/users.socket.js");
const communicationSocket = require("./sockets/communication.socket.js");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

authSocket(io);
usersSocket(io);
communicationSocket(io);

const port = process.env.PORT || 8002;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

app.use("/api", router);

app.use(URLnotFoundHandler);
app.use(errorHandler);

const dbURI = process.env.DB_CONNECTION_STRING;

mongoose
	.connect(dbURI)
	.then(() => {
		console.log("MongoDB connected!");
		server.listen(port, () => {
			console.log(`Server started on: ${port} !!`);
		});
	})
	.catch((err) => {
		console.error("Error", err);
	});
