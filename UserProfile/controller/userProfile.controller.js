const { default: mongoose } = require("mongoose");
const UserProfile = require("../model/userProfile.model.js");
const UserProfileHistory = require("../model/userProfileHistory.model.js");
const BookCategory = require("../model/bookCategory.model.js");
const { getAuthenticationData } = require("../sockets/auth.socket");

const axios = require('axios');
const apiKey = 'AIzaSyBo7Cgj_S1yGJL7mGQidsHoKOdklug1nkI';

const getconnected = async (req, res) => {
	try {

        if (!req.requestor.user_id) {
            return res.status(400).json({ status: "error", message: "User ID is required" });
        }

		const ConectedData = await UserProfile.find({
			user_id_1: req.requestor.user_id,
			is_active: true
		});

		const transformedData = ConectedData.map(ConectedData => ({
			user_id_1: ConectedData.user_id_1,
			user_id_2: ConectedData.matched_id,
			matched_id: ConectedData.matched_id,
			status: ConectedData.is_active
		}));
	
		if(ConectedData){
			return res.status(200).json({
				status: "success",
				message: "Already connected.",
				match_data:transformedData
			});
		}else{
			return res.status(404).json({
				status: "error",
				message: "Record not found.",
				data: ConectedData,
			});
		}
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const user_profile_match = async (req, res) => {
	const { user_id_2 } = req.body;
	try {
		const ConectedData = await UserProfile.findOne({
			user_id_1:req.requestor.user_id,
			user_id_2:user_id_2
		});
	
		if(ConectedData){
			var userData = await getAuthenticationData({ user_id: user_id_2});
			return res.status(200).json({
				status: "success",
				message: "Already connected.",
				match_data: {user_id_1: ConectedData.user_id_1,user_id_2: ConectedData.matched_id,matched_id: ConectedData.matched_id,status: ConectedData.is_active},
				match_user: userData,
			});
		}else{
			const ConectedRecord = await UserProfile.create({
				user_id_1:req.requestor.user_id,
				user_id_2:user_id_2
			});
			const userData = await getAuthenticationData({ user_id: user_id_2});
			if (!userData) {
				return res.status(404).json({
					status: "error",
					message: "Record not found.",
					data: userData,
				});
			}

			return res.status(200).json({
				status: "success",
				message: "Form created successfully.",
				match_data: {user_id_1: ConectedRecord.user_id_1,user_id_2: ConectedRecord.matched_id,matched_id: ConectedRecord.matched_id,status: ConectedRecord.is_active},
				match_user: userData,
			});
		}
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const deleteProfileByID = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { user_id_2 } = req.body;

        if (!user_id_2 || !req.requestor?.user_id) {
            return res.status(400).json({ status: "error", message: "User ID is required" });
        }

        // Remove ObjectId check since we are using UUIDs
        const user = await UserProfile.findOne({ user_id_2 }).session(session);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

		if (user.is_active == false) {
            return res.status(400).json({ status: "error", message: "User is inactive" });
        }

        if (user.is_deleted) {
            return res.status(400).json({ status: "error", message: "User already deleted" });
        }

        // Create history entry
        await UserProfileHistory.create(
            [{
                user_id_1: user.user_id_1,
                user_id_2: user.user_id_2,
                is_active: user.is_active,
                is_deleted: user.is_deleted,
                matched_id: user.matched_id,
            }],
            { session }
        );

        // Update user as deleted
        await UserProfile.updateOne(
            { user_id_2 },
            { $set: { is_deleted: true, updatedAt: new Date(), updatedBy: req.requestor.user_id } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ status: "success", message: "Profile deleted successfully" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error deleting profile:", error);
        
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const GetUserProfileByID = async (req, res) => {
	const { user_id_2 } = req.params;
	try {
		if (!user_id_2 || !req.requestor.user_id) {
            return res.status(400).json({ status: "error", message: "User ID is required" });
        }

		const ConectedData = await UserProfile.findOne({
			user_id_1:req.requestor.user_id,
			user_id_2:user_id_2
		});
	
		if(ConectedData){
			var userData = await getAuthenticationData({ user_id: user_id_2});
			return res.status(200).json({
				status: "success",
				message: "Already connected.",
				match_data: {user_id_1: ConectedData.user_id_1,user_id_2: ConectedData.matched_id,matched_id: ConectedData.matched_id,status: ConectedData.is_active},
				match_user: userData,
			});
		}else{
			return res.status(404).json({
				status: "error",
				message: "Record not found.",
				data: userData,
			});
		}
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};


const GetBooksList = async (req, res) => {
	try {
        const { category, search, limit = 10, page = 1 } = req.query;
        //const startIndex = (page - 1) * limit;

        // Fetch books from Google Books API
		const queryParts = [];
		if (search) queryParts.push(encodeURIComponent(search));
		if (category) queryParts.push(`subject:${encodeURIComponent(category)}`);
		const query = queryParts.length ? queryParts.join('+') : 'books';
		
		const startIndex = page ? (page - 1) * (limit || 10) : 0;
		const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${limit || 10}&key=${apiKey}`;
        const response = await axios.get(url);
        const books = response.data.items || [];
        
        return res.status(200).json({
            status: "success",
            message: "Books retrieved successfully.",
            data: 
				books.map(book => ({
				title: book.volumeInfo.title,
				categories: book.volumeInfo.categories,	
                authors: book.volumeInfo.authors || [],
                description: book.volumeInfo.description || "No description available.",
                thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
                infoLink: book.volumeInfo.infoLink
            }))
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const GetBookCategoryList = async (req, res) => {
	try {
        
		const categoryList = await BookCategory.find({
			is_deleted: false,
			is_active: true
		});
	
		if(!categoryList){
			return res.status(404).json({
				status: "error",
				message: "Category not found.",
			});
		}else{
			return res.status(200).json({
				status: "success",
				message: "Book category record list.",
				data: categoryList,
			});
		}
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};


const GetBookByID = async (req, res) => {
    try {
        const { book_id } = req.params; // Extract book_id from URL params
        
        if (!book_id) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        const url = `https://www.googleapis.com/books/v1/volumes/${book_id}?key=${apiKey}`;

        const response = await axios.get(url);
        const book = response.data;

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({
            status: "success",
            message: "Book retrieved successfully.",
            data: {
                title: book.volumeInfo.title || "No title available",
                categories: book.volumeInfo.categories || [],
                authors: book.volumeInfo.authors || [],
                description: book.volumeInfo.description || "No description available.",
                thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
                infoLink: book.volumeInfo.infoLink || "",
            }
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = {
	getconnected,
	user_profile_match,
	deleteProfileByID,
	GetUserProfileByID,
	GetBooksList,
	GetBookCategoryList,
	GetBookByID
};
