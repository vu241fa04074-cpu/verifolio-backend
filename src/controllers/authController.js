const User = require("../models/User");

const asyncHandler = require(
  "express-async-handler"
);

const generateToken = require(
  "../utils/generateToken"
);


// REGISTER USER
const registerUser = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      username,
      password,
    } = req.body;

    // CHECK EXISTING USER
    const existingUser =
      await User.findOne({
        $or: [
          { email },
          { username },
        ],
      });

    if (existingUser) {
      res.status(400);

      throw new Error(
        "User already exists"
      );
    }

    // CREATE USER
    const user =
      await User.create({
        name,
        email,
        username,
        password,
      });

    res.status(201).json({
      message:
        "User registered successfully",

      token:
        generateToken(user._id),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username:
          user.username,
        role: user.role,
      },
    });
  }
);


// LOGIN USER
const loginUser = asyncHandler(
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    // FIND USER
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      res.status(400);

      throw new Error(
        "Invalid email or password"
      );
    }

    // CHECK PASSWORD
    const isMatch =
      await user.matchPassword(
        password
      );

    if (!isMatch) {
      res.status(400);

      throw new Error(
        "Invalid email or password"
      );
    }

    res.json({
      message:
        "Login successful",

      token:
        generateToken(user._id),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username:
          user.username,
        role: user.role,
      },
    });
  }
);


// CURRENT USER
const getMe = asyncHandler(
  async (req, res) => {
    res.json(req.user);
  }
);


module.exports = {
  registerUser,
  loginUser,
  getMe,
};
