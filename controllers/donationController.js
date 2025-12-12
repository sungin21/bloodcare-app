const User = require("../models/userModel");

// Mark a donor’s donation date
const markDonation = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        lastDonationDate: new Date(),
        eligible: false,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Donation recorded. Donor marked as ineligible for 90 days.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error marking donation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking donation",
    });
  }
};

module.exports = { markDonation };
