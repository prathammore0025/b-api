const multer = require("multer");
const path = require("path");

const DEFAULT_FILE_TYPES = ["jpeg", "jpg", "png", "pdf", "docx"];
const BASE_URL = "http://3.86.11.6:8001/uploads/";

const fileUploadMiddleware = (allowedTypes = DEFAULT_FILE_TYPES) => {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/"); // Ensure "uploads" folder exists
		},
		filename: (req, file, cb) => {
			cb(null, `${Date.now()}-${file.originalname}`);
		},
	});

	const fileFilter = (req, file, cb) => {
		const allowedRegex = new RegExp(allowedTypes.join("|"), "i");
		const extname = allowedRegex.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedRegex.test(file.mimetype);

		if (extname && mimetype) {
			cb(null, true);
		} else {
			cb(new Error(`Allowed file types: ${allowedTypes.join(", ")}`));
		}
	};

	const upload = multer({
		storage: storage,
		limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
		fileFilter: fileFilter,
	});

	return (req, res, next) => {
		upload.single("file")(req, res, (err) => {
			if (err) {
				return res.status(400).json({ error: err.message });
			}
			if (!req.file) {
				return res
					.status(400)
					.json({ status: "error", message: "File is required" });
			}
			if (req.file) {
				req.body.file_url = `${BASE_URL}${req.file.filename}`;
			}

			next();
		});
	};
};

module.exports = fileUploadMiddleware;
