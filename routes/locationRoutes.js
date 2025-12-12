const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const Location = require("../models/locationModel");

// =========================
// 📍 Add or Update Location (Fixed)
// =========================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userId = req.user?._id || req.userId;

    // ✅ Save in GeoJSON format
    const newLocation = {
      user: userId,
      address: address || "",
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // Mongo expects [lng, lat]
      },
    };

    // ✅ Update if user already has a location, else create new
    const savedLocation = await Location.findOneAndUpdate(
      { user: userId },
      newLocation,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      location: savedLocation,
    });
  } catch (error) {
    console.error("Error saving location:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving location",
      error: error.message,
    });
  }
});

// =========================
// 🌍 Get All Locations (Admin Use)
// =========================
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const locations = await Location.find()
      .populate("user", "name email bloodGroup")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All locations fetched successfully",
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching locations",
      error: error.message,
    });
  }
});

// =========================
// 🩸 Get All Donor Locations (for Map)
// =========================
router.get("/donors", authMiddleware, async (req, res) => {
  try {
    const donors = await Location.find({ available: true })
      .populate("user", "name email bloodGroup")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Donor locations fetched successfully",
      locations: donors,
    });
  } catch (error) {
    console.error("Error fetching donor locations:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching donor locations",
      error: error.message,
    });
  }
});
// =========================
// 🧭 Find Nearby Donors (within radius in km)
// =========================
router.get("/nearby", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, bloodGroup } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required in query params",
      });
    }

    const center = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Geo query (Mongo expects distance in meters)
    const pipeline = [
      {
        $geoNear: {
          near: center,
          distanceField: "distance",
          spherical: true,
          maxDistance: parseFloat(radius) * 1000, // convert km → meters
        },
      },
      { $match: { available: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { "user.password": 0 } }, // don’t send password
    ];

    const nearbyDonors = await Location.aggregate(pipeline);

    // Optional filter by blood group (client side or here)
    const filteredDonors = bloodGroup
      ? nearbyDonors.filter(
          (d) => d.user?.bloodGroup?.toLowerCase() === bloodGroup.toLowerCase()
        )
      : nearbyDonors;

    return res.status(200).json({
      success: true,
      count: filteredDonors.length,
      message: `Found ${filteredDonors.length} donors within ${radius} km`,
      donors: filteredDonors,
    });
  } catch (error) {
    console.error("Error fetching nearby donors:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching nearby donors",
      error: error.message,
    });
  }
});

module.exports = router;
