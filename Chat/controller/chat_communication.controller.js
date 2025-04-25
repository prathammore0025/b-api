const { default: mongoose } = require("mongoose");
const ChatStart = require("../model/users_messages.model.js");
var multer  =   require('multer');
const fs = require('fs');
const path = require('path');

const {
	getUserByIdSocket,
	getUsersAlldata,
	addChatData
} = require("../sockets/chat.socket.js");

const getChatList = async (req, res) => {
	try {
		const { user_id } = req.requestor;
		const user = await getUsersAlldata({ user_id });
		const UserChatList = await ChatStart.find({ sender_id: user_id });


		const userMap = user.reduce((acc, user) => {
			acc[user.user_id] = {
				full_name: user.full_name,
				profile_picture: user.profile_picture
			};
			return acc;
		}, {});


		const enrichedMessages = UserChatList.map(message => ({
			...message,
			sender_details: userMap[message.sender_id] || { full_name: "Unknown", profile_picture: "default.jpg" },
			receiver_details: userMap[message.receiver_id] || { full_name: "Unknown", profile_picture: "default.jpg" }
		}));


		const cleanMessages = (messages) => {
			return messages.map(msg => ({
				_id: msg._doc._id,
				sender_id: msg._doc.sender_id,
				receiver_id: msg._doc.receiver_id,
				content: msg._doc.content,
				message_type: msg._doc.message_type,
				is_seen: msg._doc.is_seen,
				seen_time: msg._doc.seen_time,
				is_active: msg._doc.is_active,
				is_deleted: msg._doc.is_deleted,
				messages: msg._doc.messages,
				createdAt: msg._doc.createdAt,
				updatedAt: msg._doc.updatedAt,
				sender_details: msg.sender_details,
				receiver_details: msg.receiver_details
			}));
		};
		
		// Example usage:
		const cleanedResponse = cleanMessages(enrichedMessages);
		
		if (!UserChatList) {
			return res.status(404).json({
				status: "error",
				message: "No chat found",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "Message record list",
			message_type: cleanedResponse
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const getChatDetail = async (req, res) => {
	try {
		const { user_id } = req.requestor;
		const { id } = req.params;
		const UserChatList = await ChatStart.find({ sender_id: user_id, receiver_id:id });
		if (!UserChatList) {
			return res.status(404).json({
				status: "error",
				message: "No chat found",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "Message record list",
			message_type: UserChatList
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};
const create_chat = async (req, res) => {
	try {
		const { user_id } = req.requestor;
		const user = await getUserByIdSocket({ user_id });
	
		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}
	
		if (user.status === "error") {
			return res.status(404).json({
				status: "error",
				message: user.message || "Something went wrong",
			});
		}
	
		// Define upload directory
		const uploadDir = path.join(process.env.UPLOADPATH, 'UsersData');
	
		// Ensure upload directory exists
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
	
		// Multer storage configuration
		const storage = multer.diskStorage({
			destination: function (req, file, callback) {
				callback(null, uploadDir);
			},
			filename: function (req, file, callback) {
				const fileName = `${Date.now()}_${file.originalname}`;
				callback(null, fileName);
			}
		});
	
		const upload = multer({ storage }).any(); // Accept multiple file uploads
	
		upload(req, res, async function (err) {
			if (err) {
				return res.status(500).json({
					SUCCESS: 0,
					Message: 'File upload failed',
					Error: err.message
				});
			}
	
			// Extract uploaded file details & determine file types
			const uploadedFiles = req.files.map(file => ({
				filename: file.filename,
				path: file.path,
				mimetype: file.mimetype
			}));
	
			// Determine message type
			let messageType = [];
			if (req.body.content) messageType.push("text");
	
			uploadedFiles.forEach(file => {
				if (file.mimetype.startsWith("image/")) messageType.push("image");
				else if (file.mimetype.startsWith("video/")) messageType.push("video");
				else messageType.push("file");
			});
			
			// Create chat entry after file upload
			try {
				var receiver_id = req.body.receiver_id;
				var content = req.body.content || null;
				var message_type = messageType.join(", ");

				var file_paths = uploadedFiles.map(file => file.path); // Store file paths
				var	is_seen = req.body.is_seen;
				var	seen_time = req.body.is_seen ? new Date() : null;

				const user = await addChatData({ user_id,receiver_id,content,message_type,file_paths,is_seen,seen_time });
				
				const chatcreate = await ChatStart.create({
					sender_id: user_id,
					receiver_id: req.body.receiver_id,
					content: req.body.content || null,
					message_type: messageType.join(", "), // Store types as comma-separated string
					file_paths: uploadedFiles.map(file => file.path), // Store file paths
					is_seen: req.body.is_seen,
					seen_time: req.body.is_seen ? new Date() : null,
					created_by: user_id,
					updated_by: user_id,
				});
	
				res.status(200).json({
					status: "success",
					message: "Message sent successfully",
					message_type: messageType.join(", "),
					chatcreate,
					uploadedFiles,
				});
			} catch (error) {
				res.status(500).json({
					status: "error",
					message: "Error while saving chat data",
					error: error.message
				});
			}
		});
	
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

const create_video = async (req, res) => {
	try {
		const { user_id } = req.requestor;
		const user = await getUserByIdSocket({ user_id });
	
		if (!user) {
			return res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}
	
		if (user.status === "error") {
			return res.status(404).json({
				status: "error",
				message: user.message || "Something went wrong",
			});
		}

		// const chatcreate = await ChatStart.create({
		// 	sender_id: user_id,
		// 	receiver_id: req.body.receiver_id,
		// 	content: req.body.content || null,
		// 	message_type: messageType.join(", "), // Store types as comma-separated string
		// 	file_paths: uploadedFiles.map(file => file.path), // Store file paths
		// 	is_seen: req.body.is_seen,
		// 	seen_time: req.body.is_seen ? new Date() : null,
		// 	created_by: user_id,
		// 	updated_by: user_id,
		// });

		res.status(200).json({
			status: "success",
			message: "Message sent successfully",
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

module.exports = { 
	getChatList,
	getChatDetail,
	create_chat, 
	create_video
};
