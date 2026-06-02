// Backend Query Optimization Utilities
// Use these patterns in controllers to prevent N+1 queries and improve performance

const mongoose = require("mongoose");

// BATCH POPULATION: Load related data in a single query instead of multiple
const batchPopulate = async (Model, ids, populateFields) => {
  return await Model.find({ _id: { $in: ids } })
    .populate(populateFields)
    .lean();
};

// PAGINATION HELPER: Always use skip/limit for large datasets
const paginate = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Number(limit) };
};

// LEAN QUERIES: Use .lean() for read-only queries to reduce memory overhead
// Example: User.find({}).lean() instead of User.find({})
// Lean() removes Mongoose overhead (27% faster for large queries)

// PROJECTION: Only select needed fields to reduce network payload
// Example: User.find({}, "name email username") instead of all fields

// COMPOUND INDEXES: Use these patterns for common queries
// Example in model:
// userSchema.index({ email: 1 });
// userSchema.index({ toUser: 1, status: 1 }); // For queries filtering by toUser AND status

// CONNECTION POOLING: Configured in db.js with maxPoolSize: 10
// This handles concurrent requests efficiently

// CACHING: User cache in authMiddleware.js reduces repeated DB lookups
// TTL: 5 minutes per user to balance freshness and performance

// AGGREGATION PIPELINE: For complex multi-step queries
const getComplexStats = async (Model, pipeline) => {
  return await Model.aggregate(pipeline)
    .allowDiskUse(true); // For large datasets that exceed memory
};

// INDEXES TO CREATE IN EACH MODEL
const indexPatterns = {
  users: [
    { email: 1 },
    { username: 1 },
    { role: 1 },
    { isVerified: 1 },
    { googleId: 1 },
  ],
  endorsements: [
    { toUser: 1, status: 1 }, // For pending endorsement queries
    { fromUser: 1, toUser: 1 }, // Prevent duplicates
    { status: 1 }, // Status filtering
  ],
  verificationRequests: [
    { userId: 1, status: 1 }, // User's verification history
    { status: 1 }, // Admin review filtering
  ],
  projects: [
    { userId: 1 }, // User's projects
    { createdAt: -1 }, // Recent projects
  ],
};

module.exports = {
  batchPopulate,
  paginate,
  indexPatterns,
  getComplexStats,
};
