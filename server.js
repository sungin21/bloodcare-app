// ===============================================
// SERVER.JS (FINAL CLEAN VERSION)
// ===============================================

const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const otpRoutes = require("./routes/otpRoutes");

// Load env variables
dotenv.config();

// Connect MongoDB
connectDB();
require("./cron/eligibilityJob");

// Init express
const app = express();
app.use(express.json());

// ===============================================
// ✅ CORS FIX FOR VERCEL FRONTEND
// ===============================================
const allowedOrigins = [
  "https://bloodcare-app.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(morgan("dev"));


// ================= ROUTES ==================
app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/InventoryRoutes"));
app.use("/api/v1/location", require("./routes/locationRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/donation", require("./routes/donationRoutes"));
app.use("/api/v1/request", require("./routes/requestRoutes"));
app.use("/api/v1/otp", require("./routes/otpRoutes"));


// Create HTTP server
const server = http.createServer(app);


// ================= SOCKET.IO FIX =================
const socketIO = require("socket.io");

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});


// ===============================================
// SOCKET CONNECTION WITH AUTH CHECK
// ===============================================

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // ---------- TOKEN AUTH ----------
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("❌ No token → disconnecting socket");
    return socket.disconnect(true);
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    socket.user = decoded; // attach user data to socket
    console.log("🟢 Authenticated user:", decoded.userId);
  } catch (err) {
    console.log("❌ Invalid token → disconnecting");
    return socket.disconnect(true);
  }

  const userId = socket.user.userId;

  // ---------- REGISTER ROOM ----------
  socket.on("registerUser", () => {
    socket.join(userId.toString());
    console.log(`📌 User joined personal room: ${userId}`);
  });

  // ---------- REAL-TIME LOCATION UPDATE ----------
  socket.on("updateLocation", async (payload) => {
    try {
      const Location = require("./models/locationModel");

      const { latitude, longitude, address } = payload;
      if (!latitude || !longitude) return;

      const newLocation = {
        user: userId,
        address: address || "",
        location: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        available: true,
      };

      const saved = await Location.findOneAndUpdate(
        { user: userId },
        newLocation,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Broadcast to everyone
      io.emit("donorUpdated", {
        _id: saved._id,
        user: { _id: userId, bloodGroup: socket.user.bloodGroup },
        address: saved.address,
        location: saved.location,
        updatedAt: saved.updatedAt,
      });

      console.log("📍 Location updated:", userId);
    } catch (error) {
      console.error("❌ Error updating location:", error);
    }
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});


// ===============================================
// RUN SERVER
// ===============================================
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgBlue
      .white
  );
});
