const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Simple in-memory cache for user lookups (TTL: 5 minutes)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const protect = async (req, res, next) => {
  try {
    let token;

    // Check authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Check cache first to reduce DB hits
      if (userCache.has(userId)) {
        const cached = userCache.get(userId);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          req.user = cached.user;
          return next();
        } else {
          userCache.delete(userId);
        }
      }

      // Get user from DB
      const user = await User.findById(userId).select("-password").lean();

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Cache the user
      userCache.set(userId, { user, timestamp: Date.now() });

      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    // Clear cache on token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Token failed" });
  }
};

// Optional: Cache invalidation when user updates
const invalidateUserCache = (userId) => {
  userCache.delete(userId.toString());
};

module.exports = {
  protect,
  invalidateUserCache,
};
