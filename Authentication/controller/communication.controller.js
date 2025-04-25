const { default: mongoose } = require("mongoose");
// const UserDecryptHistory = require("../model/decrypt_user_history_model.js");
const Users = require("../model/users.model.js");
// const UserDecrypt = require("../model/decrypt_user_model.js");
// const UserHistory = require("../model/usersHistory.model.js");
// const UserHistory = require("../model/usersHistory.model.js");
const { decryptData } = require("../utils/security.util.js");

const getUserById = async ({ user_id }) => {
	try {
		const userData = await Users.findOne({ user_id });
        
		if (!userData) {
			return {
				status: "error",
				message: "User not found",
			};
		}

		if (userData.is_deleted === true) {
			return {
				status: "error",
				message: "User is deleted",
			};
		}

		return userData;
	} catch (error) {
		console.error("Error fetching user:", error);
		return null;
	}
};

const ChatCreate = async ({ req, user_id, created_by }) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const userData = await Users.findOne({ user_id }).session(session);
		if (!userData) {
			return {
				status: "error",
				message: "User not found",
			};
		}

		if (userData.is_deleted === true) {
			return {
				status: "error",
				message: "User is deleted",
			};
		}

        // await UserHistory.create(
		// 	[
		// 		{
		// 			user_id: userData.user_id,
		// 			email: userData.email,
		// 			password_hash: userData.password_hash,
		// 			full_name: userData.full_name,
		// 			profile_picture: userData.profile_picture,
		// 			subscription_status: userData.subscription_status,
		// 			mfa_enabled: userData.mfa_enabled,
		// 			roles: userData.roles,
		// 			country: userData.country,
		// 			is_active: userData.is_active,
		// 			is_deleted: userData.is_deleted,
		// 			created_by: created_by.user_id,
		// 			updated_by: created_by.user_id,
		// 		},
		// 	],
		// 	{ session }
		// );

		// await UserHistory.create(
		// 	[
		// 		{
		// 			user_id: userData.user_id,
		// 			email: userData.email,
		// 			password_hash: userData.password_hash,
		// 			full_name: userData.full_name,
		// 			profile_picture: userData.profile_picture,
		// 			subscription_status: userData.subscription_status,
		// 			mfa_enabled: userData.mfa_enabled,
		// 			roles: userData.roles,
		// 			country: userData.country,
		// 			is_active: userData.is_active,
		// 			is_deleted: userData.is_deleted,
		// 			created_by: created_by.user_id,
		// 			updated_by: created_by.user_id,
		// 		},
		// 	],
		// 	{ session }
		// );

		// await UserDecryptHistory.create(
		// 	[
		// 		{
		// 			decrypted_user_id: "2c751bc6-81f0-45e4-86b4-513cdb480e77",
		// 			user_id: userData.user_id,
		// 			email: decryptData(userData.email),
		// 			password_hash: decryptData(userData.password_hash),
		// 			is_active: userData.is_active,
		// 			is_deleted: userData.is_deleted,
		// 			created_by: created_by.user_id,
		// 			updated_by: created_by.user_id,
		// 		},
		// 	],
		// 	{ session }
		// );

		// const updatedUsers = await Users.findOneAndUpdate(
		// 	{ user_id },
		// 	{ ...req, updated_by: created_by.user_id },
		// 	{ new: true, session }
		// );

		// await UserDecrypt.findOneAndUpdate(
		// 	{ user_id },
		// 	{
		// 		email: decryptData(req.email),
		// 		password_hash: decryptData(req.password_hash),
		// 		is_active: req.is_active,
		// 		is_deleted: req.is_deleted,
		// 		updated_by: created_by.user_id,
		// 	},
		// 	{ new: true, session }
		// );

		await session.commitTransaction();
		session.endSession();

		return updatedUsers;
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error fetching user:", error);
		return null;
	}
};

const getUser = async ({ search, limit: getLimit, page = 1 }) => {
	try {
		const limit = Number(getLimit) || 10;
		const skip = (page - 1) * limit;

		let query = {};

		if (typeof search === "string") {
			if (/[^a-zA-Z0-9 ]/.test(search)) {
				return res.json({
					status: "error",
					message: "Search cannot contain special characters",
				});
			}

			if (search === "true" || search === "false") {
				query.is_active = search === "true";
			}
		}

		const users = await Users.find({
			...query,
			is_deleted: false,
		})
			.skip(skip)
			.limit(limit);

		const usersDecrypt = await UserDecrypt.aggregate([
			{
				$match: {
					email: { $regex: new RegExp(search, "i") },
					is_deleted: false,
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "user_id",
					as: "user_details",
				},
			},
			{ $unwind: "$user_details" },
			{ $replaceRoot: { newRoot: "$user_details" } },
			{ $skip: skip },
			{ $limit: limit },
		]);

		const totalRecords = await Users.countDocuments({
			...query,
			is_deleted: false,
		});
		let totalDecryptRecords;

		let totalPages = Math.ceil(totalRecords / limit);

		let returnRecords = users;
		if (search.trim() !== "true" && search.trim() !== "false") {
			totalDecryptRecords = await UserDecrypt.countDocuments({
				email: { $regex: new RegExp(search, "i") },
				is_deleted: false,
			});
			totalPages = Math.ceil(totalDecryptRecords / limit);
			returnRecords = usersDecrypt;
		}

		return {
			current_page: page,
			total_pages: totalPages,
			total_records: totalDecryptRecords ? totalDecryptRecords : totalRecords,
			users: returnRecords,
		};
	} catch (error) {
		console.error("Error fetching user:", error);
		return null;
	}
};


const getUsersAllData = async ({ user_id }) => {
	try {
		const userData = await Users.find({ });
        
		if (!userData) {
			return {
				status: "error",
				message: "User not found",
			};
		}

		if (userData.is_deleted === true) {
			return {
				status: "error",
				message: "User is deleted",
			};
		}

		return userData;
	} catch (error) {
		console.error("Error fetching user:", error);
		return null;
	}
};



module.exports = { getUser, getUserById, ChatCreate,getUsersAllData };
