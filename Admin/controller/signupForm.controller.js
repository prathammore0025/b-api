const { default: mongoose } = require("mongoose");
const signupForm = require("../model/signupForm.model.js");
const SignupFormHistory = require("../model/signupFormHistory.model.js");
const Subscription = require("../model/subscription.model.js");

const getSignUpForms = async (req, res) => {
	try {
		const search = req.query.search;
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		let query = {};

		if (typeof search === "string") {
			if (/[^a-zA-Z0-9 -]/.test(search)) {
				return res.json({
					status: "error",
					message: "Search cannot contain special characters",
				});
			}

			if (search === "true" || search === "false") {
				query.is_active = search === "true";
			} else if (search.trim() !== "") {
				query.slug = { $regex: new RegExp(search, "i") };
			}
		}

		const totalRecords = await signupForm.countDocuments({
			...query,
			is_deleted: false,
		});

		const data = await signupForm
			.find({ ...query, is_deleted: false })
			.skip((page - 1) * limit)
			.limit(limit);

		const totalPages = Math.ceil(totalRecords / limit);

		return res.status(200).json({
			status: "success",
			message: "Forms retrieved successfully",
			current_page: page,
			total_pages: totalPages,
			total_records: totalRecords,
			data,
		});
	} catch (error) {
		console.error("Error:", error);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};

const GetByIDFormBySlugHandler = async (req, res) => {
	try {
		const { slug } = req.params;

		if (slug == "") {
			return res.status(404).json({ message: "Invalid request." });
		}

		const slugData = await signupForm.findOne({
			slug,
		});

		if (!slugData) {
			return res
				.status(404)
				.json({ status: "error", message: "Slug not found." });
		}

		if (slugData.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: "Slug is deleted",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Slug retrieved successfully",
			data: slugData,
		});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const GetFormIDWiseForm = async (req, res) => {
	try {
		const { form_id } = req.params;

		if (form_id == "") {
			return res.status(404).json({ message: "Invalid request." });
		}

		const formData = await signupForm.findOne({
			form_id,
		});

		if (!formData) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}

		if (formData.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: "Form is deleted",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Form retrieved successfully",
			data: formData,
		});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const postFormBySlugHandler = async (req, res) => {
	const { slug, name, step, subscription_id } = req.body;

	try {
		const checkSlugDuplicate = await signupForm.findOne({ slug });
		const checkNameDuplicate = await signupForm.findOne({ name });

		if (checkSlugDuplicate && checkSlugDuplicate.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: `The slug exists in trash.`,
			});
		}

		if (checkSlugDuplicate) {
			return res.status(400).json({
				status: "error",
				message: "The slug already exists.",
			});
		}

		if (checkNameDuplicate && checkNameDuplicate.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: `The name exists in trash.`,
			});
		}

		if (checkNameDuplicate) {
			return res.status(400).json({
				status: "error",
				message: "The name already exists.",
			});
		}

		const getDefaultSubscription = await Subscription.findOne({
			is_default: true,
			is_deleted: false,
		});

		if (!subscription_id && !getDefaultSubscription) {
			return res.status(400).json({
				status: "error",
				message: "Default subscription not found.",
			});
		}

		if (subscription_id) {
			const foundSubscriptions = await Subscription.find({
				subscription_id: { $in: subscription_id },
				is_deleted: false,
				is_active: true,
			});

			const foundIds = foundSubscriptions.map((sub) =>
				sub.subscription_id.toString()
			);
			const missingIds = subscription_id.filter((id) => !foundIds.includes(id));

			if (missingIds.length > 0) {
				return res.status(400).json({
					status: "error",
					message: `Subscription ID(s) not found or deleted: ${missingIds.join(
						", "
					)}`,
				});
			}
		}

		const data = await signupForm.create({
			slug,
			name,
			step,
			subscription_id: subscription_id
				? subscription_id
				: [getDefaultSubscription.subscription_id],
			created_by: req.requestor.user_id,
			updated_by: req.requestor.user_id,
		});

		return res.status(200).json({
			status: "success",
			message: "Form created successfully.",
			data: data,
		});
	} catch (error) {
		console.error("Error: ", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const updateSignUpFormById = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { form_id } = req.params;
		const updateData = req.body;

		const formData = await signupForm
			.findOne({
				form_id,
			})
			.session(session);

		if (!formData) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}

		if (formData.is_deleted) {
			return res.status(404).json({
				status: "error",
				message: "Form is deleted",
			});
		}

		if (updateData.subscription_id) {
			const checkSubscription = await Subscription.findOne({
				subscription_id: updateData.subscription_id,
				is_deleted: false,
			}).session(session);

			if (!checkSubscription) {
				return res.status(400).json({
					status: "error",
					message: "Subscription not found",
				});
			}
		}

		await SignupFormHistory.create(
			[
				{
					form_id: formData.form_id,
					slug: formData.slug,
					name: formData.name,
					step: formData.step,
					is_active: formData.is_active,
					is_deleted: false,
					subscription_id: formData.subscription_id,
					created_by: req.requestor.user_id,
					updated_by: req.requestor.user_id,
					createdAt: formData.createdAt,
					updatedAt: formData.updatedAt,
				},
			],
			{ session }
		);

		const updatedForm = await signupForm.findOneAndUpdate(
			{ form_id },
			{ ...updateData, updated_by: req.requestor.user_id },
			{ new: true, session }
		);

		await session.commitTransaction();
		session.endSession();

		if (req.body.is_deleted === true) {
			return res.json({
				status: "success",
				message: "Form deleted successfully.",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Form updated successfully",
			data: updatedForm,
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const deleteFormByFormId = async (req, res) => {
	try {
		req.body = { is_deleted: true };
		return await updateSignUpFormById(req, res);
	} catch (error) {
		console.error("Error:", error);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};

const GetBySlug = async (req, res) => {
	try {
		const { slug } = req.params;

		if (slug == "") {
			return res.status(404).json({ message: "Invalid request." });
		}

		const slugData = await signupForm.findOne({
			slug,
		});

		if (!slugData) {
			return res
				.status(404)
				.json({ status: "error", message: "Slug not found." });
		}

		if (slugData.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: "Slug is deleted",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Slug retrieved successfully",
			data: slugData,
		});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const GetFormIDWiseRecord = async (req, res) => {
	try {
		const { form_id } = req.params;

		if (form_id == "") {
			return res.status(404).json({ message: "Invalid request." });
		}

		const formData = await signupForm.findOne({
			form_id,
		});

		if (!formData) {
			return res.status(404).json({
				status: "error",
				message: "Form not found",
			});
		}

		if (formData.is_deleted) {
			return res.status(400).json({
				status: "error",
				message: "Form is deleted",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Form retrieved successfully",
			data: formData,
		});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

// Get Slug wise Form Using Socket
const GetSlugWiseForm = async (request) => {
	try {
		const { slug } = request;
		if (slug == "") {
			return { status: "error", message: "Invalid request." };
		}

		const slugData = await signupForm.findOne({
			slug,
		});
		if (!slugData) {
			return { status: "error", message: "Slug not found." };
		}
		if (slugData.is_active == false) {
			return {
				status: "error",
				message: "Form is inactive",
			};
		}
		if (slugData.is_deleted == true) {
			return {
				status: "error",
				message: "Slug is deleted",
			};
		}

		return {
			status: "success",
			message: "Slug retrieved successfully",
			data: {
				form_id: slugData.form_id,
				slug: slugData.slug,
				name: slugData.name,
				step: slugData.step,
				subscription_id: slugData.subscription_id,
				is_active: slugData.is_active,
				is_deleted: slugData.is_deleted,
				created_by: slugData.created_by,
			},
		};
	} catch (error) {
		console.error("Error:", error);
		return { message: "Internal server error" };
	}
};

// Get Form wise Form Using Socket
const GetFormIDWiseFormSocket = async (request) => {
	try {
		const { form_id } = request;
		if (form_id == "") {
			return { status: "error", message: "Invalid request." };
		}

		const form_idData = await signupForm.findOne({
			form_id,
		});
		if (!form_idData) {
			return { status: "error", message: "form_id not found." };
		}
		if (form_idData.is_active == false) {
			return {
				status: "error",
				message: "Form is inactive",
			};
		}
		if (form_idData.is_deleted == true) {
			return {
				status: "error",
				message: "form_id is deleted",
			};
		}
		return {
			status: "success",
			message: "Form retrieved successfully",
			data: form_idData,
		};
	} catch (error) {
		console.error("Error:", error);
		return { message: "Internal server error" };
	}
};

// Get Default Form
const GetDefaultFormSocket = async (request) => {
	try {
		const form_idData = await signupForm.findOne({
			is_default: true,
		});
		if (!form_idData) {
			return { status: "error", message: "form_id not found." };
		}
		if (form_idData.is_active == false) {
			return {
				status: "error",
				message: "Form is inactive",
			};
		}
		if (form_idData.is_deleted == true) {
			return {
				status: "error",
				message: "form_id is deleted",
			};
		}
		return {
			status: "success",
			message: "Form retrieved successfully",
			data: form_idData,
		};
	} catch (error) {
		console.error("Error:", error);
		return { message: "Internal server error" };
	}
};
module.exports = {
	getSignUpForms,
	postFormBySlugHandler,
	updateSignUpFormById,
	deleteFormByFormId,
	GetByIDFormBySlugHandler,
	GetBySlug,
	GetFormIDWiseForm,
	GetFormIDWiseRecord,
	GetSlugWiseForm,
	GetDefaultFormSocket,
	GetFormIDWiseFormSocket,
};
