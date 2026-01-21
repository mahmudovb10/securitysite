const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const User = require("../models/User");

// All routes require authentication
router.use(authenticate);

/**
 * Get current user's profile
 * GET /api/users/profile
 */
router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update current user's profile
 * PUT /api/users/profile
 */
router.put("/profile", async (req, res, next) => {
  try {
    const { username, email } = req.body;

    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all users (public info only)
 * GET /api/users
 */
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("username email role lastActiveTime createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
