const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
} = require("../controllers/adminController");

const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// =====================
// EXISTING LIST ROUTES
// =====================
router.get(
  "/donar-list",
  authMiddleware,
  adminMiddleware,
  getDonarsListController
);

router.get(
  "/hospital-list",
  authMiddleware,
  adminMiddleware,
  getHospitalListController
);

router.get("/org-list", authMiddleware, adminMiddleware, getOrgListController);

router.delete(
  "/delete-donar/:id",
  authMiddleware,
  adminMiddleware,
  deleteDonarController
);

// =====================
// PENDING HOSPITALS
// =====================
router.get(
  "/pending-hospitals",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const hospitals = await User.find({
        role: "hospital",
        approvalStatus: "pending",
      });

      return res.status(200).send({ success: true, hospitals });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, message: error.message });
    }
  }
);

// =====================================
// 1️⃣ SEND OTP TO ADMIN FOR APPROVAL
// =====================================
router.post(
  "/send-approval-otp",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const admin = req.user;

      if (!admin || !admin.email) {
        return res.status(400).json({
          success: false,
          message: "Admin email not found",
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await Otp.create({
        email: admin.email,
        code,
        purpose: "adminApproval",
        expiresAt,
      });

      await sendEmail({
        to: admin.email,
        subject: "Admin Approval OTP",
        text: `Your OTP for approving hospital registrations is: ${code}. It is valid for 10 minutes.`,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email.",
      });
    } catch (error) {
      console.error("Error sending admin approval OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
        error: error.message,
      });
    }
  }
);

// =====================================
// 2️⃣ APPROVE HOSPITAL (WITH OTP)
// =====================================
router.patch(
  "/approve-hospital/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const admin = req.user;

      const otpDoc = await Otp.findOne({
        email: admin.email,
        purpose: "adminApproval",
      })
        .sort({ createdAt: -1 })
        .exec();

      if (!otpDoc) {
        return res.status(400).json({
          success: false,
          message: "No OTP found. Please request a new OTP.",
        });
      }

      if (otpDoc.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "OTP expired. Please request a new OTP.",
        });
      }

      if (otpDoc.code !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // ✅ OTP valid → approve hospital
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { isApproved: true, approvalStatus: "approved" },
        { new: true }
      );

      await Otp.deleteOne({ _id: otpDoc._id });

      return res.status(200).send({ success: true, updated });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, message: error.message });
    }
  }
);

// ======================
// 3️⃣ REJECT HOSPITAL
// ======================
router.patch(
  "/reject-hospital/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { isApproved: false, approvalStatus: "rejected" },
        { new: true }
      );

      return res.status(200).send({ success: true, updated });
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, message: error.message });
    }
  }
);

module.exports = router;
