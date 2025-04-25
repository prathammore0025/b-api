const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { Schema } = mongoose;

const versionManagementSchema = new Schema(
  {
    version_management_id: {
      type: String,
      default: uuidv4,
      required: true,
    },
    app_version: {
      type: String,
      required: true,
    },
    supported_versions: {
      type: String,
      required: true,
    },
    apk_url: {
      type: String,
      required: true,
    },
    release_date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const VersionManagement = mongoose.model("version_management", versionManagementSchema);

module.exports = VersionManagement;
