const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    const { email, inventoryType, bloodGroup, quantity } = req.body;

    if (!email || !inventoryType || !bloodGroup || !quantity) {
      return res.status(400).send({
        success: false,
        message: "email, inventoryType, bloodGroup and quantity are required",
      });
    }

    // check donor/hospital email exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found for provided email",
      });
    }

    // logged-in organisation (MUST EXIST)
    if (!req.userId) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized (no organization found)",
      });
    }

    req.body.organization = req.userId;

    // ---------------- OUT INVENTORY ----------------
    if (inventoryType === "out") {
      const organisationId = new mongoose.Types.ObjectId(req.userId);

      // total IN
      const totalInData = await inventoryModel.aggregate([
        {
          $match: {
            organization: organisationId,
            inventoryType: "in",
            bloodGroup,
          },
        },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]);
      const totalIn = totalInData[0]?.total || 0;

      // total OUT
      const totalOutData = await inventoryModel.aggregate([
        {
          $match: {
            organization: organisationId,
            inventoryType: "out",
            bloodGroup,
          },
        },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]);
      const totalOut = totalOutData[0]?.total || 0;

      const available = totalIn - totalOut;

      if (available < Number(quantity)) {
        return res.status(400).send({
          success: false,
          message: `Only ${available}ML of ${bloodGroup} available`,
        });
      }

      req.body.hospital = user._id;
      req.body.donar = undefined;
    }

    // ---------------- IN INVENTORY ----------------
    if (inventoryType === "in") {
      req.body.donar = user._id;
      req.body.hospital = undefined;
    }

    // final sanitization
    req.body.inventoryType = inventoryType.toLowerCase();
    req.body.bloodGroup = bloodGroup.toUpperCase();
    req.body.quantity = Number(quantity);

    // save record
    const inventory = new inventoryModel(req.body);
    await inventory.save();

    return res.status(201).send({
      success: true,
      message: "New Blood Record Added",
      inventory,
    });

  } catch (error) {
    console.log("CREATE INVENTORY ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Error in Create Inventory API",
      error: error.message,
    });
  }
};


// GET ALL INVENTORY OF ORGANISATION
const getInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organization: req.userId })
      .populate("donar", "-password")
      .populate("hospital", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Inventory fetched",
      inventory,
    });

  } catch (error) {
    console.log("GET INVENTORY ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};


// GET RECENT INVENTORY (limit 3)
const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organization: req.userId })
      .limit(3)
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Recent inventory fetched",
      inventory,
    });

  } catch (error) {
    console.log("RECENT INVENTORY ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch recent inventory",
      error: error.message,
    });
  }
};


// GET INVENTORY FOR HOSPITAL
const getInventoryHospitalController = async (req, res) => {
  try {
    const filters = req.body.filters || {};

    const inventory = await inventoryModel
      .find(filters)
      .populate("donar", "-password")
      .populate("hospital", "-password")
      .populate("organization", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Hospital inventory fetched",
      inventory,
    });

  } catch (error) {
    console.log("HOSPITAL INVENTORY ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch hospital inventory",
      error: error.message,
    });
  }
};


// GET DONORS
const getDonarsController = async (req, res) => {
  try {
    const donorIds = await inventoryModel.distinct("donar", {
      organization: req.userId,
    });

    const donars = await userModel
      .find({ _id: { $in: donorIds } })
      .select("-password");

    return res.status(200).send({
      success: true,
      message: "Donor list fetched",
      donars,
    });

  } catch (error) {
    console.log("GET DONORS ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch donors",
      error: error.message,
    });
  }
};


// GET HOSPITALS
const getHospitalController = async (req, res) => {
  try {
    const hospitalIds = await inventoryModel.distinct("hospital", {
      organization: req.userId,
    });

    const hospitals = await userModel
      .find({ _id: { $in: hospitalIds } })
      .select("-password");

    return res.status(200).send({
      success: true,
      message: "Hospitals list fetched",
      hospitals,
    });

  } catch (error) {
    console.log("GET HOSPITAL ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch hospitals",
      error: error.message,
    });
  }
};


// GET ORGANISATIONS FOR DONOR
const getOrgnaisationController = async (req, res) => {
  try {
    const orgIds = await inventoryModel.distinct("organization", {
      donar: req.userId,
    });

    const organisations = await userModel
      .find({ _id: { $in: orgIds } })
      .select("-password");

    return res.status(200).send({
      success: true,
      message: "Organisations for donor fetched",
      organisations,
    });

  } catch (error) {
    console.log("GET ORGANISATION ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch organisations",
      error: error.message,
    });
  }
};


// GET ORGANISATIONS FOR HOSPITAL
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const orgIds = await inventoryModel.distinct("organization", {
      hospital: req.userId,
    });

    const organisations = await userModel
      .find({ _id: { $in: orgIds } })
      .select("-password");

    return res.status(200).send({
      success: true,
      message: "Organisations for hospital fetched",
      organisations,
    });

  } catch (error) {
    console.log("GET ORG HOSPITAL ERROR:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch organisations for hospital",
      error: error.message,
    });
  }
};


module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
