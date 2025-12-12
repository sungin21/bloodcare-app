const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).send({ success: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    req.user = { _id: decoded.userId };
    req.userId = decoded.userId; // ⭐ REQUIRED ⭐

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err);
    return res.status(401).send({ success: false, message: "Auth Failed" });
  }
};
