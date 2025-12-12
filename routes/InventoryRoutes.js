const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
} = require("../controllers/inventoryController");

const router = express.Router();

// =========================
// ⭐ CREATE INVENTORY (IN / OUT)
// =========================
router.post("/create-inventory", authMiddleware, createInventoryController);

// =========================
// ⭐ GET ALL INVENTORY RECORDS FOR ORG
// =========================
router.get("/get-inventory", authMiddleware, getInventoryController);

// =========================
// ⭐ GET LATEST 3 RECORDS
// =========================
router.get("/get-recent-inventory", authMiddleware, getRecentInventoryController);

// =========================
// ⭐ GET INVENTORY (HOSPITAL FILTER)
// =========================
router.post("/get-inventory-hospital", authMiddleware, getInventoryHospitalController);

// =========================
// ⭐ GET DONOR LIST
// =========================
router.get("/get-donars", authMiddleware, getDonarsController);

// =========================
// ⭐ GET HOSPITAL LIST
// =========================
router.get("/get-hospitals", authMiddleware, getHospitalController);

// =========================
// ⭐ GET ORGANISATIONS FOR DONOR
// =========================
router.get("/get-orgnaisation", authMiddleware, getOrgnaisationController);

// =========================
// ⭐ GET ORGANISATIONS FOR HOSPITAL
// =========================
router.get(
  "/get-orgnaisation-for-hospital",
  authMiddleware,
  getOrgnaisationForHospitalController
);

module.exports = router;
