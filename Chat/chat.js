const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const router = require("./routes/index.js");
const { URLnotFoundHandler, errorHandler } = require("./utils/errors.util.js");
const path = require('path');
dotenv.config();

const app = express();
const port = process.env.PORT || 8005;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

app.use("/api", router);

// upload
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
//app.use("/Jsonfiles", express.static(path.join(__dirname, 'Jsonfiles')));

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
