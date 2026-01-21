const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * LOGIN
 * POST /api/auth/login
 *
 * Sets user status to 'online' on successful login
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // CRITICAL: Set user status to ONLINE
    await user.setOnline();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        lastActiveTime: user.lastActiveTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT
 * POST /api/auth/logout
 *
 * Sets user status to 'offline'
 */
exports.logout = async (req, res, next) => {
  try {
    // CRITICAL: Set user status to OFFLINE
    await req.user.setOffline();

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REGISTER
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username, email, and password",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email or username",
      });
    }

    // Create user (status defaults to 'offline')
    const user = await User.create({
      username,
      email,
      password,
      role: "user",
      status: "offline",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET CURRENT USER
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // Update activity to keep user online
    await req.user.updateActivity();

    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        lastActiveTime: req.user.lastActiveTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
