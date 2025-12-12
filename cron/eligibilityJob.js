const cron = require("node-cron");
const User = require("../models/userModel");

// 🕐 This job runs daily at 00:30 (12:30 AM)
cron.schedule("30 0 * * *", async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90); // 90 days before today

  try {
    const result = await User.updateMany(
      {
        lastDonationDate: { $lte: cutoff },
        eligible: false,
      },
      { $set: { eligible: true } }
    );

    console.log(
      `✅ Cron Job: Re-enabled ${result.modifiedCount} donors eligible again.`
    );
  } catch (err) {
    console.error("❌ Cron job failed:", err.message);
  }
});

