const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");

// REGISTER USER (Local)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;

  // Check existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    username,
    password,
    authProvider: "local",
  });

  res.status(201).json({
    message: "User registered successfully",
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
});

// LOGIN USER (Local)
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  res.json({
    message: "Login successful",
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
});

// GOOGLE AUTH CALLBACK
// Flow: Frontend sends Google auth code → Backend exchanges code for tokens
// → Backend fetches Google user info → Create or find user in DB → Return JWT token
const googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, name, profileImage } = req.body;

  if (!googleId || !email) {
    res.status(400);
    throw new Error("Missing Google credentials");
  }

  try {
    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // Existing Google user - return token
      return res.json({
        message: "Google login successful",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    }

    // Check if email already exists (linked account scenario)
    user = await User.findOne({ email });

    if (user && user.authProvider === "local") {
      res.status(400);
      throw new Error(
        "Email already registered with local account. Please login with password."
      );
    }

    // Create new Google user
    const username = email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 5);

    user = await User.create({
      googleId,
      email,
      name,
      username,
      profileImage,
      authProvider: "google",
      isVerified: true,
    });

    res.status(201).json({
      message: "Google account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// GET CURRENT USER
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
};

