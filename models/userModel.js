const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["admin", "donor", "hospital", "organisation"],
      default: "donor",  // user always registers as donor
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
      min: 16,
    },

    pincode: {
      type: String,
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    agree: {
      type: Boolean,
      required: true,
    },

    pdfFile: {
      type: String,
      default: null,
    },

    lastDonationDate: { type: Date, default: null },
    eligible: { type: Boolean, default: true },

    // ADMIN APPROVAL PROPERTIES
    isApproved: { type: Boolean, default: true },
    approvalStatus: { type: String, default: "approved" },

    // OTP + EMAIL VERIFICATION
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
