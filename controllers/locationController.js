// controllers/locationController.js
const Location = require("../models/locationModel");
const User = require("../models/userModel"); // if you want to populate name, bloodGroup

// Add or update a user's location
exports.addOrUpdateLocation = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.userId); // adapt to your auth middleware
    const { latitude, longitude, address } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ success: false, message: "latitude and longitude must be numbers" });
    }

    const locationData = {
      user: userId,
      address: address || "",
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    // upsert: update if exists, otherwise create
    const updated = await Location.findOneAndUpdate(
      { user: userId },
      locationData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: "Location saved", data: updated });
  } catch (error) {
    console.error("addOrUpdateLocation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user's saved location
exports.getUserLocation = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.userId);
    const location = await Location.findOne({ user: userId }).populate("user", "name email bloodGroup");
    if (!location) return res.status(404).json({ success: false, message: "No location found" });
    res.json({ success: true, data: location });
  } catch (error) {
    console.error("getUserLocation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate("user", "name email bloodGroup").sort({ createdAt: -1 });
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    console.error("getAllLocations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Find nearby donors by coords and radius (km)
exports.getNearbyDonors = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, bloodGroup } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "latitude and longitude query params required" });
    }

    const center = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // build query
    const query = {
      location: {
        $nearSphere: {
          $geometry: center,
          $maxDistance: parseFloat(radius) * 1000, // meters
        },
      },
    };

    if (bloodGroup) {
      // if bloodGroup is stored on User, we must populate and filter later, or store bloodGroup in Location
      query.bloodGroup = bloodGroup; // keep if you store BG in location
    }

    const results = await Location.find(query).populate("user", "name email bloodGroup").limit(200);

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("getNearbyDonors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

