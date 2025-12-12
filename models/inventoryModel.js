const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryType: {
      type: String,
      required: [true, "inventory type required"],
      enum: ["in", "out"],
    },

    bloodGroup: {
      type: String,
      required: [true, "blood group is required"],
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
    },

    quantity: {
      type: Number,
      required: [true, "blood quantity is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
    },

    // This must be set by controller (ObjectId of organisation)
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "organization is required"],
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: function () {
        // hospital required when this record is an OUT request
        return this.inventoryType === "out";
      },
    },

    donar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: function () {
        // donar required when this record is an IN donation
        return this.inventoryType === "in";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("inventory", inventorySchema);
