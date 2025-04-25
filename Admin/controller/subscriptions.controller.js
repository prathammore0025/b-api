const { default: mongoose } = require("mongoose");
const Subscription = require("../model/subscription.model.js");
const SubscriptionHistory = require("../model/subscriptionHistory.model.js");

const calculatedEndTime = async ({
	starttime,
	endtime,
	plan,
	term,
	session,
}) => {
	let calEndTime = new Date(starttime);

	switch (plan) {
		case "day":
			calEndTime.setDate(calEndTime.getDate() + term);
			break;
		case "month":
			calEndTime.setMonth(calEndTime.getMonth() + term);
			break;
		case "year":
			calEndTime.setFullYear(calEndTime.getFullYear() + term);
			break;
	}

	if (endtime) {
		let providedEndTime = new Date(endtime);
		providedEndTime.setHours(0, 0, 0, 0);
		calEndTime.setHours(0, 0, 0, 0);

		if (providedEndTime.getTime() !== calEndTime.getTime()) {
			if (session) {
				await session.abortTransaction();
				session.endSession();
			}
			return false;
		}
	}

	return calEndTime;
};

const getAllPlansHandler = async (req, res) => {
	try {
		const search = req.query.search;
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		const skip = (page - 1) * limit;

		let query = {};

		if (typeof search === "string") {
			if (/[^a-zA-Z0-9 ]/.test(search)) {
				return res.json({
					status: "error",
					message: "Search cannot contain special characters",
				});
			}

			if (search === "day" || search === "month" || search === "year") {
				query.plan = search;
			} else if (search === "true" || search === "false") {
				query.isactive = search === "true";
			} else if (search.trim() !== "") {
				query.plan_name = { $regex: new RegExp(search, "i") };
			}
		}

		const subscriptions = await Subscription.find({
			...query,
			is_deleted: false,
		})
			.skip(skip)
			.limit(limit);

		const totalRecords = await Subscription.countDocuments({
			...query,
			is_deleted: false,
		});

		const totalPages = Math.ceil(totalRecords / limit);

		res.json({
			status: "success",
			message: "Subscriptions retrieved successfully.",
			data: {
				current_page: page,
				total_pages: totalPages,
				total_records: totalRecords,
				subscriptions: subscriptions.map((sub) => ({
					subscription_id: sub.subscription_id,
					plan_name: sub.plan_name,
					plan: sub.plan,
					term: sub.term || null,
					amount: sub.amount?.toFixed(2) || "0.00",
					starttime: sub.starttime || null,
					endtime: sub.endtime || null,
					remarks: sub.remarks || "",
					isactive: sub.isactive,
				})),
			},
		});
	} catch (error) {
		console.error("Error fetching subscriptions:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const getPlansByIDHandler = async (req, res) => {
	try {
		const { subscription_id } = req.params;

		const subscription = await Subscription.findOne({
			subscription_id,
		});

		if (!subscription) {
			return res.status(404).json({
				status: "error",
				message: "Subscription not found",
			});
		}

		if (subscription.is_deleted === true) {
			return res.status(404).json({
				status: "error",
				message: "Subscription is deleted",
			});
		}

		res.json({
			status: "success",
			message: "Subscription retrieved successfully.",
			data: {
				subscription_id: subscription.subscription_id,
				plan_name: subscription.plan_name,
				plan: subscription.plan,
				term: subscription.term || null,
				amount: subscription.amount?.toFixed(2) || "0.00",
				starttime: subscription.starttime || null,
				endtime: subscription.endtime || null,
				remarks: subscription.remarks || "",
				isactive: subscription.isactive,
			},
		});
	} catch (error) {
		console.error("Error fetching subscription:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const addNewPlanHandler = async (req, res) => {
	try {
		const {
			plan_name,
			plan,
			term,
			remarks,
			isactive,
			starttime,
			amount,
			endtime,
		} = req.body;

		const checkDuplicate = await Subscription.findOne({ plan_name });

		if (checkDuplicate) {
			if (checkDuplicate.is_deleted) {
				return res.status(400).json({
					status: "error",
					message: "Subscription exists in trash.",
				});
			}

			if (!checkDuplicate.isactive) {
				return res.status(400).json({
					status: "error",
					message: "Subscription exists and its is Deactivated.",
				});
			}

			return res.status(400).json({
				status: "error",
				message: "Subscription exists with same plan_name.",
			});
		}

		const validateEndTime = await calculatedEndTime({
			endtime,
			starttime,
			plan,
			term,
		});

		if (!validateEndTime) {
			return res
				.status(400)
				.json({ status: "error", message: "Wrong endtime" });
		}

		const data = await Subscription.create({
			plan_name,
			plan,
			term,
			amount,
			remarks,
			isactive,
			starttime,
			endtime: endtime ? endtime : validateEndTime,
			created_by: req.requestor.user_id,
			updated_by: req.requestor.user_id,
		});

		return res.status(200).json({
			status: "success",
			message: "Subscription created successfully",
			data: {
				subscription_id: data.subscription_id,
				plan_name: data.plan_name,
				plan: data.plan,
				term: data.term,
				amount: data.amount,
				starttime: data.starttime,
				endtime: data.endtime,
				remarks: data.remarks,
				isactive: data.isactive,
			},
		});
	} catch (error) {
		console.error("Error adding new plan:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const updatePlanByIDHandler = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { subscription_id } = req.params;
		const updateData = req.body;

		const subscription = await Subscription.findOne({
			subscription_id,
		}).session(session);

		if (!subscription) {
			return res.status(404).json({
				status: "error",
				message: "Subscription not found",
			});
		}

		if (subscription.is_deleted) {
			return res.status(404).json({
				status: "error",
				message: "Subscription is deleted",
			});
		}

		const validateEndTime = await calculatedEndTime({
			starttime: req.body.starttime
				? req.body.starttime
				: subscription.starttime,
			endtime: req.body.endtime ? req.body.endtime : subscription.endtime,
			plan: req.body.plan ? req.body.plan : subscription.plan,
			term: req.body.term ? req.body.term : subscription.term,
			session,
		});

		if (!validateEndTime) {
			return res
				.status(400)
				.json({ status: "error", message: "Wrong endtime" });
		}

		await SubscriptionHistory.create(
			[
				{
					subscription_id,
					plan_name: subscription.plan_name,
					plan: subscription.plan,
					term: subscription.term,
					amount: subscription.amount,
					remarks: subscription.remarks,
					isactive: subscription.isactive,
					starttime: subscription.starttime,
					endtime: subscription.endtime,
					is_deleted: false,
					is_default: subscription.is_default,
					created_by: req.requestor.user_id,
					updated_by: req.requestor.user_id,
				},
			],
			{ session }
		);

		const updatedSubscription = await Subscription.findOneAndUpdate(
			{ subscription_id },
			{
				...updateData,
				endtime: updateData.endtime ? updateData.endtime : validateEndTime,
				updated_by: req.requestor.user_id,
			},
			{ new: true, session }
		);

		await session.commitTransaction();
		session.endSession();

		if (updatedSubscription.is_deleted) {
			return res.json({
				status: "success",
				message: "Subscription deleted successfully.",
			});
		}

		return res.json({
			status: "success",
			message: "Subscription updated successfully",
			data: {
				subscription_id: updatedSubscription.subscription_id,
				plan_name: updatedSubscription.plan_name,
				plan: updatedSubscription.plan,
				term: updatedSubscription.term || null,
				amount: updatedSubscription.amount?.toFixed(2) || "0.00",
				starttime: updatedSubscription.starttime || null,
				endtime: updatedSubscription.endtime || null,
				remarks: updatedSubscription.remarks || "",
				isactive: updatedSubscription.isactive,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error updating subscription:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const deletePlansByIDHandler = async (req, res) => {
	try {
		req.body = { is_deleted: true };
		return await updatePlanByIDHandler(req, res);
	} catch (error) {
		console.error("Error deleting subscription:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

module.exports = {
	getAllPlansHandler,
	addNewPlanHandler,
	getPlansByIDHandler,
	deletePlansByIDHandler,
	updatePlanByIDHandler,
};
