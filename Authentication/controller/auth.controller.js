const UserDecrypt = require("../model/decrypt_user_model.js");
const Otp = require("../model/otp.model.js");
const Users = require("../model/users.model.js");
const UserInfo = require("../model/user_info.model.js");

const { decryptData } = require("../utils/security.util.js");

const { generateAccessToken } = require("../utils/token.util.js");
const axios = require("axios");
const Joi = require("joi");
const { default: mongoose } = require("mongoose");

const {getFormSocket,getFormByFormIDSocket,getDefaultFormSocket} = require("../sockets/form.socket.js");

const sendOtpHelperFun = async ({ expireTime, purpose, email }) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const OTP_SIZE = process.env.OTP_SIZE ? Number(process.env.OTP_SIZE) : 6;
		const min = 10 ** (OTP_SIZE - 1);
		const max = 10 ** OTP_SIZE - 1;

		const otpCode = Math.floor(min + Math.random() * (max - min + 1));

		if (!expireTime) {
			expireTime = new Date(Date.now() + 2 * 60 * 1000);
		}

		await Otp.updateOne(
			{ email, purpose, status: "pending" },
			{ status: "expired" },
			{ session }
		);

		const tempotp = await Otp.create(
			[
				{
					email,
					otp_code: otpCode,
					purpose,
					status: "pending",
					expire_time: expireTime,
				},
			],
			{ session }
		);

		// Handle email sending function
		const emailSent = {}; // Replace this with actual email sending logic

		await session.commitTransaction();
		session.endSession();

		// return emailSent;
		return tempotp[0].otp_code;
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		return false;
	}
};

const loginHandler = async (req, res) => {
	try {
		const { email, password } = req.body;

		const decryptEmail = decryptData(email);

		const userDecrypt = await UserDecrypt.findOne({ email: decryptEmail });

		if (!userDecrypt) {
			return res.status(401).json({
				status: "error",
				message: "User not found",
			});
		}

		const user = await Users.findOne({ user_id: userDecrypt.user_id });

		if (userDecrypt.is_deleted) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deleted" });
		}

		if (!userDecrypt.is_active) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deactivated" });
		}

		if (decryptData(password) !== decryptData(user.password_hash)) {
			return res
				.status(401)
				.json({ status: "error", message: "Invalid password" });
		}

		if (user.mfa_enabled) {
			const otp = await sendOtpHelperFun({
				email: decryptEmail,
				purpose: "mfa",
			});

			if (!otp) {
				return res.status(500).json({
					status: "error",
					message: "Failed to send OTP email",
				});
			}

			return res.status(200).json({
				status: "Success",
				message: "OTP sent successfully",
				data: {
					mfa_enabled: true,
				},
				otp,
			});
		}

		const { password_hash, ...userWithoutPassword } = user.toObject();
		const token = generateAccessToken(userWithoutPassword);

		res.status(200).json({
			status: "Success",
			message: "Login successful",
			data: {
				user_id: user.user_id,
				name: user.full_name,
				roles: user.roles,
				country: user.country,
				is_active: user.is_active,
				mfa_enabled: user.mfa_enabled,
				created_at: user.createdAt,
				updated_at: user.updatedAt,
				token,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};

const verifyOtpHandler = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { email, otp, purpose } = req.body;

		const decryptEmail = decryptData(email);

		const otpRecord = await Otp.findOne({
			email: decryptEmail,
			purpose,
			status: "pending",
		}).session(session);

		if (!otpRecord) {
			return res.status(404).json({
				status: "error",
				message: "OTP not found",
			});
		}

		if (otpRecord.otp_code !== otp) {
			return res.status(401).json({
				status: "error",
				message: "Invalid OTP",
			});
		}

		if (new Date() > otpRecord.expire_time || otpRecord.status === "expired") {
			await Otp.findOneAndUpdate(
				{ otp_code: otp },
				{ status: "expired" },
				{ new: true, session }
			);

			await session.commitTransaction();
			session.endSession();

			return res.status(401).json({
				status: "error",
				message: "OTP has expired",
			});
		}

		if (otpRecord.status === "used") {
			return res.status(401).json({
				status: "error",
				message: "OTP already used",
			});
		}

		if (purpose === "mfa") {
			await Otp.findOneAndUpdate(
				{ email: decryptEmail, otp_code: otp },
				{ status: "used" },
				{ session }
			);

			const userDecrypt = await UserDecrypt.findOne({
				email: decryptEmail,
			});

			const user = await Users.findOne({
				user_id: userDecrypt.user_id,
			});

			// these two are not required i have added these just in case
			if (user.is_deleted) {
				return res
					.status(403)
					.json({ status: "error", message: "Account is deleted" });
			}
			if (!user.is_active) {
				return res
					.status(403)
					.json({ status: "error", message: "Account is deactivated" });
			}

			const { password_hash, ...userWithoutPassword } = user.toObject();
			const token = generateAccessToken(userWithoutPassword);

			await session.commitTransaction();
			session.endSession();

			return res.status(200).json({
				status: "Success",
				message: "Login successful",
				data: {
					user_id: user.user_id,
					name: user.full_name,
					roles: user.roles,
					country: user.country,
					is_active: user.is_active,
					mfa_enabled: user.mfa_enabled,
					created_at: user.createdAt,
					updated_at: user.updatedAt,
					token,
				},
			});
		}

		if (purpose === "forgot_password") {
			if (!req.body.password) {
				return res.status(200).json({
					status: "success",
					message: "Otp Verified",
				});
			}

			await Otp.findOneAndUpdate(
				{ email: decryptEmail, otp_code: otp },
				{ status: "used" },
				{ session }
			);

			const user = await UserDecrypt.findOneAndUpdate(
				{ email: decryptEmail },
				{ $set: { password_hash: decryptData(req.body.password) } },
				{ new: true, session }
			);

			await Users.updateOne(
				{ user_id: user.user_id },
				{ $set: { password_hash: req.body.password } },
				{ session }
			);

			await session.commitTransaction();
			session.endSession();

			return res.status(200).json({
				status: "success",
				message: "Password Updated",
			});
		}

		await session.abortTransaction();
		session.endSession();

		res.status(401).json({ status: "error", message: "Error Verifying OTP" });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.log(error);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};

const forgotPasswordHandler = async (req, res) => {
	try {
		const { email } = req.body;

		const decryptEmail = decryptData(email);
		const user = await UserDecrypt.findOne({ email: decryptEmail });

		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		if (user.is_deleted) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deleted" });
		}

		if (!user.is_active) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deactivated" });
		}

		const otp = await sendOtpHelperFun({
			email: decryptEmail,
			purpose: "forgot_password",
		});

		if (!otp) {
			return res.status(500).json({
				status: "error",
				message: "Failed to send OTP email",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "OTP has been sent to your email address.",
			otp,
		});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const resetPasswordHandler = async (req, res) => {
	try {
		const { email, otp, password } = req.body;

		const decryptedEmail = decryptData(email);
		const user = await UserDecrypt.findOne({ email: decryptedEmail });

		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		if (user.is_deleted) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deleted" });
		}

		if (!user.is_active) {
			return res
				.status(403)
				.json({ status: "error", message: "Account is deactivated" });
		}

		req.body.purpose = "forgot_password";

		await verifyOtpHandler(req, res);
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};


//Get signupform
const getsignupform = async (req, res) => {
	try {
		
		const {slug} = req.params
		const formData = await getFormSocket({slug});

		if (formData.data.is_active == false) {
			return res.status(403).json({
				status: "error",
				message: "Form is inactive",
			});
		}
		if (formData.data.is_deleted == true) {
			return res.status(403).json({
				status: "error",
				message: "Slug is deleted",
			});
		}
		// const url = `${process.env.AdminURL}/http/get-signup-form-slug/${req.params.slug}`;
		// const response = await axios.get(url);
		if (!formData.data) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "successfully get signup form",
			data: formData.data,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.response ? error.response.data : error.message,
		});
	}
};

//Get default signup form
const signup_form_default = async (req, res) => {
	try {
		const formData = await getDefaultFormSocket();
		if (formData.data.is_active == false) {
			return res.status(403).json({
				status: "error",
				message: "Form is inactive",
			});
		}
		if (formData.data.is_deleted == true) {
			return res.status(403).json({
				status: "error",
				message: "Slug is deleted",
			});
		}
		// const url = `${process.env.AdminURL}/http/get-signup-form-slug/${req.params.slug}`;
		// const response = await axios.get(url);
		if (!formData.data) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "successfully get signup form",
			data: formData.data,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.response ? error.response.data : error.message,
		});
	}
};


const signup_form = async (req, res) => {
	try {
		const formData = await getDefaultFormSocket();
		if (formData.data.is_active == false) {
			return res.status(403).json({
				status: "error",
				message: "Form is inactive",
			});
		}
		if (formData.data.is_deleted == true) {
			return res.status(403).json({
				status: "error",
				message: "Slug is deleted",
			});
		}
		// const url = `${process.env.AdminURL}/http/get-signup-form-slug/${req.params.slug}`;
		// const response = await axios.get(url);
		if (!formData.data) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "successfully get signup form",
			data: formData.data,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Internal Server Error",
			error: error.response ? error.response.data : error.message,
		});
	}
};
//Get signupform
// const signup_form = async (req, res) => {
// 	try {
// 		const {form_id} = req.body
// 		const FormDataByFormID = await getFormByFormIDSocket({form_id});
// 		if (FormDataByFormID.data.is_active == false) {
// 			return res.status(403).json({
// 				status: "error",
// 				message: "Form is inactive",
// 			});
// 		}
// 		if (FormDataByFormID.data.is_deleted == true) {
// 			return res.status(403).json({
// 				status: "error",
// 				message: "Slug is deleted",
// 			});
// 		}
// 		// const url = `${process.env.AdminURL}/http/get-signup-form-slug/${req.params.slug}`;
// 		// const response = await axios.get(url);
// 		if (!FormDataByFormID.data) {
// 			return res.status(404).json({
// 				status: "error",
// 				message: "Form not found",
// 			});
// 		}

// 		const validateFormData = (formSchema, formData) => {
// 			const stepFields = formSchema.step.flatMap((step) => step.fields);
// 			// Create Joi schema from dynamic form
// 			const joiSchema = stepFields.reduce((schema, field) => {
// 				let validator = Joi.string();

// 				if (field.required) {
// 					validator = validator.required();
// 				} else {
// 					validator = validator.allow(null, "");
// 				}

// 				if (field.validation) {
// 					if (field.validation.minlength) {
// 						validator = validator.min(Number(field.validation.minlength));
// 					}
// 					if (field.validation.maxlength) {
// 						validator = validator.max(Number(field.validation.maxlength));
// 					}
// 				}

// 				schema[field.name] = validator;
// 				return schema;
// 			}, {});

// 			const schema = Joi.object(joiSchema);

// 			// Validate each form data entry
// 			for (const data of formData) {
// 				const { error } = schema.validate(data, { abortEarly: false });
// 				if (error) {
// 					console.log(
// 						"Validation Error:",
// 						error.details.map((e) => e.message)
// 					);
// 					return { valid: false, errors: error.details.map((e) => e.message) };
// 				}
// 			}
// 			return { valid: true };
// 		};
// 		// Fetch form schema from Admin API
// 		// const url = `${process.env.AdminURL}/http/get-formid-wise-record/${req.body.form_id}`;
// 		// const response = await axios.get(url);
// 		const response = FormDataByFormID;
// 		if (!response.data || !response.data || !response.data.step) {
// 			return res.status(401).json({
// 				status: "error",
// 				message: "Form schema not found",
// 			});
// 		}
// 		const formSchema = { step: response.data.step };
// 		const formData = req.body.form_data;
// 		// Validate form data
// 		const validation_check = validateFormData(formSchema, formData);

		
// 		if (!validation_check.valid) {
// 			return res.status(422).json({
// 				status: "error",
// 				message: "Form data validation failed",
// 				errors: validation_check.errors,
// 			});
// 		}

// 		// Proceed with user creation
// 		const userData = req.body.form_data;
// 		const requiredFields = ["email", "password_hash", "full_name"]; // Define required fields
// 		const missingFields = requiredFields.filter(field => !userData[0][field]);
// 		if (missingFields.length > 0) {
// 			return res.status(400).json({
// 				message: "Missing required fields.",
// 				error: `Missing fields: ${missingFields.join(", ")}`
// 			});
// 		}
// 		// Create User
// 		const newUser = await Users.create({
// 			email: userData[0].email,
// 			password_hash: userData[0].password_hash,
// 			full_name: userData[0].full_name,
// 			subscription_status: "Active",
// 			mfa_enabled: false,
// 			roles: userData[0].roles,
// 			country: userData[0].country,
// 			is_active: true,
// 			is_deleted: false,
// 		});

// 		// Store User Info
// 		await UserInfo.create({
// 			form_id: req.body.form_id,
// 			user_id: newUser._id,
// 		});

// 		// Decrypt and store user credentials
// 		const decryptEmail = decryptData(userData[0].email);
// 		const decryptPass = decryptData(userData[0].password_hash);

// 		await UserDecrypt.create({
// 			user_id: newUser._id,
// 			email: decryptEmail,
// 			password_hash: decryptPass,
// 		});

// 		return res.status(200).json({
// 			status: "success",
// 			message: "Signup successfully",
// 		});
// 	} catch (error) {
// 		console.error("Signup Error:", error.message);
// 		res.status(500).json({
// 			message: "Internal Server Error",
// 			error: error.response ? error.response.data : error.message,
// 		});
// 	}
// };

//Get signupform
const signup_form_register = async (req, res) => {
	try {
		const userData = req.body.form_data;
		const requiredFields = ["email", "password_hash", "full_name"]; // Define required fields
		const missingFields = requiredFields.filter(field => !userData[0][field]);
		if (missingFields.length > 0) {
			return res.status(400).json({
				message: "Missing required fields.",
				error: `Missing fields: ${missingFields.join(", ")}`
			});
		}

		const checkEmail = decryptData(userData[0].email);
		const userDecrypt = await UserDecrypt.findOne({ email: checkEmail });
		if (userDecrypt) {
			return res.status(401).json({
				status: "error",
				message: "Email is already used.",
			});
		}
		// Create User
		const { v4: uuidv4 } = require('uuid');
		const newUser = await Users.create({
			email: userData[0].email,
			password_hash: userData[0].password_hash,
			full_name: userData[0].full_name,
			subscription_status: "Active",
			mfa_enabled: false,
			roles: userData[0].roles,
			country: userData[0].country,
			is_active: true,
			is_deleted: false,
			user_id: uuidv4()
		});
		// Store User Info

		const formData = await getDefaultFormSocket();
		await UserInfo.create({
			form_id: formData.data.form_id,
			user_id: newUser.user_id,
		});

		// Decrypt and store user credentials
		const decryptEmail = decryptData(userData[0].email);
		const decryptPass = decryptData(userData[0].password_hash);

		await UserDecrypt.create({
			user_id: newUser._id,
			email: decryptEmail,
			password_hash: decryptPass,
		});

		return res.status(200).json({
			status: "success",
			message: "Signup successfully",
		});
	} catch (error) {
		console.error("Signup Error:", error.message);
		res.status(500).json({
			message: "Internal Server Error",
			error: error.response ? error.response.data : error.message,
		});
	}
};

module.exports = {
	loginHandler,
	verifyOtpHandler,
	forgotPasswordHandler,
	resetPasswordHandler,
	getsignupform,
	signup_form_default,
	signup_form,
	signup_form_register
};
