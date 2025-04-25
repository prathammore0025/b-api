const Maintenance = require("../model/maintenance.model.js");
const VersionManagement = require("../model/version_management.model.js");
const { description, message } = require("../schema/login.schema.js");

const checksplash = async (req, res) => {
	try {
		const maintenance = await Maintenance.find({
			is_active: true,
			is_deleted: false
		});

		const currentDate = new Date();
		const activeMaintenance = maintenance.filter(item => {
			const startTime = new Date(item.start_time);
			const endTime = new Date(item.end_time);
			
			return currentDate >= startTime && currentDate <= endTime;
		});
		
		  if (activeMaintenance.length == 1) {
			return res.status(200).json({ 
				status:"success",
				message: "The server is currently in maintenance mode. Please try again later.",
				data:{
					maintenance:activeMaintenance[0].is_active,
					title:activeMaintenance[0].title,
					description:activeMaintenance[0].description,
				}
			});
		  } else {
				//1 Check valid version
				const ValidVersion = await VersionManagement.findOne({
					app_version:req.body.app_version
				});

				if (!ValidVersion) {
					return res.status(404).send(
						{status: 'data not found', message: 'This version is not available.'}
					);
				}

				//2 Latest Version
				const latestVersion = await VersionManagement.findOne({
				}).sort({ release_date: -1 });

				if (!latestVersion) {
					return res.status(400).send({ status: 'error', message: 'Invalid data.' });
				}
				
				//3 Latest Version
				const SupportVersion = await VersionManagement.countDocuments({
					supported_versions: latestVersion.app_version,
					app_version : req.body.app_version
				});

				if(latestVersion.app_version == req.body.app_version){
					return res.status(200).send({ 
						status: 0, 
						message: 'Not required to update. you have latest version app', 
						data: {
							maintenance:false,
							update: latestVersion
						}
						
					});
				}
				else if(SupportVersion > 0){
					return res.status(200).send({ 
						status: 2,
						message: 'Not compalsary update',
						data: {
							maintenance:false,
							update: latestVersion,
						} 
					});
				}else{
					return res.status(200).send({ 
						status: 1, 
						message: 'force update',
						data: {
							maintenance:false,
							update: latestVersion,
						} 
					});
				}
		  }
	} catch (error) {
		return res.status(500).json({ message: "Internal server error" });
	}
};
module.exports = {checksplash};
