const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { markDonation } = require("../controllers/donationController");

router.post("/mark-donation", authMiddleware, markDonation);

module.exports = router;
