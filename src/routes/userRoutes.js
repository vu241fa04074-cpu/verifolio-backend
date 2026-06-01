const express = require("express");

const {
  searchUsers,
} = require("../controllers/userController");

const router = express.Router();


// SEARCH USERS
router.get("/", searchUsers);

module.exports = router;