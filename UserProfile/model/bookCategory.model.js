const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const categorySchema = new mongoose.Schema(
    {
        category_id: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        category_name: {
            type: String,
            required: true,
        },
        category_short_name: {
            type: String,
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
            required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false,
            required: true,
            comment: "0-NoDeleted, 1-Deleted",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("book_category", categorySchema);
