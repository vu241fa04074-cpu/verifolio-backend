const User = require("../models/User");


// SEARCH USERS
const searchUsers = async (req, res) => {
  try {

    const keyword =
      req.query.search || "";

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          username: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).select(
      "name username email"
    );

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  searchUsers,
};