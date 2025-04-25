const cron = require("node-cron");
const { sendNotification } = require("../services/notification.service");

cron.schedule("0 0 * * *", async () => {
	try {
		await sendNotification();
	} catch (error) {
		console.error("Error in sendNotification job:", error);
	}
});

module.exports = {
	startNotificationJob: () => console.log("notification cron jobs initialized"),
};
