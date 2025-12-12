const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Request = require("../models/requestModel");
const { getIO } = require("../socket");
const Otp = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");

// Helper to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =====================================
// 1️⃣ SEND OTP FOR BLOOD REQUEST
// =====================================
router.post("/send-otp", authMiddleware, async (req, res) => {
  try {
    const user = req.user; // set by authMiddleware
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP
    await Otp.create({
      email: user.email,
      code,
      purpose: "bloodRequest",
      expiresAt,
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Your Blood Request OTP",
      text: `Your OTP for confirming the blood request is: ${code}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your registered email.",
    });
  } catch (error) {
    console.error("Error sending blood request OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
});

// =====================================
// 2️⃣ SEND BLOOD REQUEST (WITH OTP)
// =====================================
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { donorId, bloodGroup, message, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = req.user;
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    // Find latest OTP for this email & purpose
    const otpDoc = await Otp.findOne({
      email: user.email,
      purpose: "bloodRequest",
    })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    // Check expiry
    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // Check code
    if (otpDoc.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ OTP valid → create request
    const newRequest = await new Request({
      requester: req.user._id,
      donor: donorId,
      bloodGroup,
      message: message || "Urgent Blood Needed",
      status: "pending",
    }).save();

    // Optional: delete OTP after use
    await Otp.deleteOne({ _id: otpDoc._id });

    // Notify donor in real-time
    const io = getIO();
    io.to(donorId.toString()).emit("bloodRequest", {
      message: "You received a blood request",
      request: newRequest,
    });

    return res.status(201).json({
      success: true,
      message: "Blood request sent & donor notified!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending request",
      error: error.message,
    });
  }
});

// =====================================
// 3️⃣ GET INCOMING REQUESTS FOR DONOR
// =====================================
router.get("/incoming", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ donor: req.user._id })
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// 4️⃣ ACCEPT REQUEST (DONOR)
// =====================================
router.patch("/accept/:id", authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;

    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const io = getIO();
    io.to(updated.requester.toString()).emit("requestAccepted", {
      message: "Your blood request was accepted!",
      request: updated,
    });

    return res.status(200).json({
      success: true,
      message: "Request accepted successfully!",
      request: updated,
    });
  } catch (error) {
    console.error("Accept error:", error);
    return res.status(500).json({
      success: false,
      message: "Error accepting request",
    });
  }
});

// =====================================
// 5️⃣ REJECT REQUEST (DONOR)
// =====================================
router.patch("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;

    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const io = getIO();
    io.to(updated.requester.toString()).emit("requestRejected", {
      message: "Your blood request was rejected.",
      request: updated,
    });

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully!",
      request: updated,
    });
  } catch (error) {
    console.error("Reject error:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting request",
    });
  }
});

module.exports = router;
