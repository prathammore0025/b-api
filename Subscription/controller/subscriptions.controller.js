const { v4: uuidv4 } = require("uuid");
const Subscription = require("../model/subscription.model.js");
const SubscriptionHistory = require("../model/subscriptionHistory.model.js");

const getAllPlansHandler = async (req, res) => {
	try {
		const plan_name = req.query.search;
		const plan = req.query.plan;
		const isactive = req.query.isactive;

		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;

		const skip = (page - 1) * limit;

		let query = {};
		if (plan_name) query.plan_name = { $regex: new RegExp(plan_name, "i") };
		if (plan) query.plan = plan;
		if (isactive !== undefined) query.isactive = isactive === "true";

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

		const data = await Subscription.create({
			plan_name,
			plan,
			term,
			amount,
			remarks,
			isactive,
			starttime,
			endtime,
			subscription_status: "Pending",
			created_by: uuidv4(), // here add user_id from from token
			updated_by: uuidv4(), // here add user_id from from token
		});

		return res.status(201).json({
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

const getPlansByIDHandler = async (req, res) => {
	try {
		const { subscription_id } = req.params;

		const subscription = await Subscription.findOne({
			subscription_id,
			is_deleted: false,
		});

		if (!subscription) {
			return res.status(404).json({
				status: "error",
				message: "Subscription not found",
			});
		}

		res.json({
			status: "success",
			message: "Subscription retrieved successfully.",
			data: {
				subscription_id: subscription._id,
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

const deletePlansByIDHandler = async (req, res) => {
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

		if (subscription.is_deleted) {
			return res.status(404).json({
				status: "error",
				message: "Subscription not found",
			});
		}

		await SubscriptionHistory.create({
			amount: subscription.amount,
			subscription_status: subscription.subscription_status,
			created_by: subscription.created_by,
			created_at: subscription.created_at,
			updated_by: subscription.updated_by,
			updated_at: subscription.updated_at,
			endtime: subscription.endtime,
			isactive: subscription.isactive,
			plan: subscription.plan,
			plan_name: subscription.plan_name,
			remarks: subscription.remarks,
			starttime: subscription.starttime,
			term: subscription.term,
			is_deleted: true,
			user_subscription_id: subscription.user_subscription_id,
			user_id: subscription.user_id,
			subscription_id: subscription.subscription_id,
			stripe_transaction_id: subscription.stripe_transaction_id,
		});

		await Subscription.findOneAndUpdate(
			{ subscription_id },
			{ is_deleted: true }
		);

		res.json({
			status: "success",
			message: "Subscription deleted successfully and moved to history.",
		});
	} catch (error) {
		console.error("Error deleting subscription:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const updatePlanByIDHandler = async (req, res) => {
	try {
		const { subscription_id } = req.params;
		const updateData = req.body;

		const updatedSubscription = await Subscription.findOneAndUpdate(
			{ subscription_id },
			{ ...updateData },
			{ new: true }
		);

		if (!updatedSubscription) {
			return res.status(404).json({
				status: "error",
				message: "Subscription not found",
			});
		}

		res.json({
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
		console.error("Error updating subscription:", error);
		res.status(500).json({
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
