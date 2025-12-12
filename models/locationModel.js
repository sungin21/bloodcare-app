// models/locationModel.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one active location per user
    },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    bloodGroup: { type: String }, // optional, can populate from user
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geo index for nearby queries
locationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Location", locationSchema);
