const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/**
 * POST /api/auth/register
 * Body: { userName, emailAddress, userPassword, contactNo }
 */
router.post("/auth/register", authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and receive JWT token
 * Body: { userName, userPassword }
 */
router.post("/auth/login", authController.login);

/**
 * Will probably handle logout on client side, but for now just incase
 * A different "commented out" option is available
 * POST /api/auth/logout
 */
// router.post("/auth/logout", authController.logout);

module.exports = router;
