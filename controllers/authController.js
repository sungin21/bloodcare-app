const userModels = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =====================================
   ⭐ REGISTER CONTROLLER
===================================== */
const registerController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      age,
      pincode,
      bloodGroup,
      agree,
    } = req.body;

    // Check existing user
    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Always register as DONOR
    const user = new userModels({
      name,
      email,
      password: hashedPassword,
      phone,
      age,
      pincode,
      bloodGroup,
      agree,
      role: "donor", // ← IMPORTANT
      pdfFile: null,
    });

    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).send({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/* =====================================
   ⭐ LOGIN CONTROLLER
===================================== */
const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Fix role mismatch: frontend sends "donar" → convert to "donor"
    let selectedRole = role;
    if (selectedRole === "donar") selectedRole = "donor";

    // Role mismatch check
    if (user.role !== selectedRole) {
      return res.status(400).send({
        success: false,
        message: "Selected role does not match your account",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).send({
      success: false,
      message: "Login failed",
      error,
    });
  }
};

/* =====================================
   ⭐ CURRENT USER CONTROLLER
===================================== */
const currentUserController = async (req, res) => {
  try {
    const user = await userModels.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Unable to fetch user",
      error,
    });
  }
};

/* =====================================
   EXPORTS
===================================== */
module.exports = {
  registerController,
  loginController,
  currentUserController,
};
