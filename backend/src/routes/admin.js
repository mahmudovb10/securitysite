const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/auth");
const { requireAdmin } = require("../middleware/roleCheck");
const upload = require("../config/multer");

// ALL routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin); // CRITICAL: Backend enforcement

/**
 * GET STATISTICS
 * GET /api/admin/statistics
 *
 * Returns real database statistics
 */
router.get("/statistics", adminController.getStatistics);

/**
 * GET ALL USERS
 * GET /api/admin/users
 */
router.get("/users", adminController.getAllUsers);

/**
 * DELETE PASSPORT RECORD (ADMIN ONLY)
 * DELETE /api/admin/records/:id
 *
 * CRITICAL: Only accessible by admin
 */
router.delete("/records/:id", adminController.deletePassportRecord);

/**
 * CREATE PASSPORT RECORD (ADMIN)
 * POST /api/admin/records
 */
router.post(
  "/records",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  adminController.createPassportRecord,
);

/**
 * UPDATE USER STATUS
 * PUT /api/admin/users/:id/status
 */
router.put("/users/:id/status", adminController.updateUserStatus);

module.exports = router;
