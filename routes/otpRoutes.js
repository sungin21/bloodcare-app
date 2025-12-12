const express = require("express");
const router = express.Router();
const OTP = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==============================
//  SEND OTP
// ==============================
router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // store OTP in DB (replace old)
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, expiresAt: expires },
      { upsert: true, new: true }
    );

    // send email
    await sendEmail(
      email,
      "Blood Request OTP Verification",
      `<h2>Your OTP is: <b>${otp}</b></h2><p>This code expires in 5 minutes.</p>`
    );

    res.json({ success: true, message: "OTP sent!" });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
//  VERIFY OTP
// ==============================
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email & OTP required" });

    const record = await OTP.findOne({ email });

    if (!record)
      return res.status(400).json({ success: false, message: "OTP not found" });

    if (record.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired. Try again." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // delete otp after verification
    await OTP.deleteOne({ email });

    res.json({ success: true, message: "OTP verified!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
