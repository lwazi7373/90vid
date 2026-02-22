const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");
const authenticateToken = require("../middleware/authMiddleware");


/**
 * GET /api/rooms?roomName=football
 * Search for the specified room
 * Note rooms can have the same name, that is roomName is not unique in database (So return might be more than one room)
 */
router.get("/search/rooms", authenticateToken, searchController.searchRoom);

/**
 * GET /search/users?userName=john 
 * Search for the specified the user
 * Note userName is unique here, clarity is essential here, unlike the rooms 
 */
router.get("/search/users", authenticateToken, searchController.searchUser);

module.exports = router;