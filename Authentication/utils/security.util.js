require("dotenv").config();
const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.Encrypted_S_Key;

const encryptData = (data) => {
	return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
	const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
	return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encryptData, decryptData };
