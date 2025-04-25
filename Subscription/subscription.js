const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const router = require("./routes/index.js");
const { URLnotFoundHandler, errorHandler } = require("./utils/errors.util.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 8006;

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
		app.listen(port, () => {
			console.log(`Server started on: ${port} !!`);
		});
	})
	.catch((err) => {
		console.error("Error", err);
	});
