const User = require("../models/User");
const PassportRecord = require("../models/PassportRecord");
const File = require("../models/File");

/**
 * GET ADMIN STATISTICS
 * GET /api/admin/statistics
 *
 * Returns REAL database statistics:
 * - Total users
 * - Online users (status='online' AND active within 10 min)
 * - Offline users
 * - Total uploaded passport records
 */
exports.getStatistics = async (req, res, next) => {
  try {
    // Get all users from database
    const allUsers = await User.find().select(
      "username email role status lastActiveTime",
    );

    const totalUsers = allUsers.length;

    // Calculate REAL online users
    // Online = status='online' AND lastActiveTime within last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const onlineUsers = allUsers.filter((user) => {
      return (
        user.status === "online" &&
        new Date(user.lastActiveTime).getTime() > tenMinutesAgo
      );
    }).length;

    const offlineUsers = totalUsers - onlineUsers;

    // Count total passport records in database
    const totalPassportRecords = await PassportRecord.countDocuments();

    // Additional statistics
    const recordsUploadedToday = await PassportRecord.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const recordsByAdmin = await PassportRecord.countDocuments({
      createdByAdmin: true,
    });

    const recordsByUsers = totalPassportRecords - recordsByAdmin;

    // Total files
    const totalFiles = await File.countDocuments();

    // Get recent records (last 5)
    const recentRecords = await PassportRecord.find()
      .populate("createdBy", "username email role")
      .populate("imageFileId")
      .populate("videoFileId")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          online: onlineUsers,
          offline: offlineUsers,
        },
        passportRecords: {
          total: totalPassportRecords,
          uploadedToday: recordsUploadedToday,
          byAdmin: recordsByAdmin,
          byUsers: recordsByUsers,
        },
        files: {
          total: totalFiles,
        },
      },
      recentRecords,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL USERS WITH STATUS
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Add real online status check for each user
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const usersWithStatus = users.map((user) => {
      const isReallyOnline =
        user.status === "online" &&
        new Date(user.lastActiveTime).getTime() > tenMinutesAgo;

      return {
        ...user.toObject(),
        isReallyOnline,
        statusLabel: isReallyOnline ? "Online" : "Offline",
      };
    });

    res.json({
      success: true,
      users: usersWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE PASSPORT RECORD (ADMIN ONLY)
 * DELETE /api/admin/records/:id
 *
 * CRITICAL: Only admin can delete records
 * Backend enforces this rule
 */
exports.deletePassportRecord = async (req, res, next) => {
  try {
    // Find the record
    const record = await PassportRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    // SECURITY CHECK: Verify user is admin
    // This is redundant with middleware but adds extra security
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only administrators can delete records",
      });
    }

    // Delete associated files from disk
    const fs = require("fs").promises;

    if (record.imageFileId) {
      const imageFile = await File.findById(record.imageFileId);
      if (imageFile) {
        // Delete physical file
        await fs.unlink(imageFile.path).catch(console.error);
        // Delete file record
        await File.findByIdAndDelete(imageFile._id);
      }
    }

    if (record.videoFileId) {
      const videoFile = await File.findById(record.videoFileId);
      if (videoFile) {
        // Delete physical file
        await fs.unlink(videoFile.path).catch(console.error);
        // Delete file record
        await File.findByIdAndDelete(videoFile._id);
      }
    }

    // Delete the passport record
    await PassportRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Record deleted successfully",
      deletedRecord: {
        id: record._id,
        fullName: record.fullName,
        passportNumber: record.passportNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE PASSPORT RECORD (ADMIN)
 * POST /api/admin/records
 *
 * Admin can create passport records
 * Same validation as user uploads
 */
exports.createPassportRecord = async (req, res, next) => {
  let savedFiles = [];

  try {
    const {
      firstName,
      lastName,
      passportNumber,
      nationality,
      dateOfBirth,
      placeOfBirth,
      issueDate,
      expiryDate,
      comment,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !passportNumber ||
      !nationality ||
      !dateOfBirth ||
      !placeOfBirth ||
      !issueDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled",
      });
    }

    // Validate file upload (at least one required)
    if (!req.files || (!req.files.image && !req.files.video)) {
      return res.status(400).json({
        success: false,
        error: "At least one file (image or video) must be uploaded",
      });
    }

    // Check duplicate passport number
    const existingRecord = await PassportRecord.findOne({
      passportNumber: passportNumber.toUpperCase(),
    });

    if (existingRecord) {
      // Clean up uploaded files
      if (req.files.image) {
        await require("fs")
          .promises.unlink(req.files.image[0].path)
          .catch(console.error);
      }
      if (req.files.video) {
        await require("fs")
          .promises.unlink(req.files.video[0].path)
          .catch(console.error);
      }

      return res.status(400).json({
        success: false,
        error: "Passport number already exists",
      });
    }

    // Save files
    let imageFileId = null;
    let videoFileId = null;

    if (req.files.image) {
      const imageFile = req.files.image[0];
      const imageRecord = await File.create({
        filename: imageFile.filename,
        originalName: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        path: imageFile.path,
        fileType: "image",
        uploadedBy: req.user._id,
      });
      imageFileId = imageRecord._id;
      savedFiles.push(imageFile.path);
    }

    if (req.files.video) {
      const videoFile = req.files.video[0];
      const videoRecord = await File.create({
        filename: videoFile.filename,
        originalName: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size,
        path: videoFile.path,
        fileType: "video",
        uploadedBy: req.user._id,
      });
      videoFileId = videoRecord._id;
      savedFiles.push(videoFile.path);
    }

    // Create passport record
    const passportRecord = await PassportRecord.create({
      createdBy: req.user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      passportNumber: passportNumber.toUpperCase().trim(),
      nationality: nationality.trim(),
      dateOfBirth: new Date(dateOfBirth),
      placeOfBirth: placeOfBirth.trim(),
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      comment: comment ? comment.trim() : "",
      imageFileId,
      videoFileId,
      createdByAdmin: true, // Mark as created by admin
    });

    await passportRecord.populate("createdBy", "username email role");
    await passportRecord.populate("imageFileId");
    await passportRecord.populate("videoFileId");

    res.status(201).json({
      success: true,
      message: "Record created successfully by admin",
      record: passportRecord,
    });
  } catch (error) {
    // Rollback: Clean up files
    for (const filePath of savedFiles) {
      await require("fs").promises.unlink(filePath).catch(console.error);
    }
    next(error);
  }
};

/**
 * UPDATE USER STATUS (ADMIN)
 * PUT /api/admin/users/:id/status
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["online", "offline"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "online" or "offline"',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: "User status updated",
      user: {
        id: user._id,
        username: user.username,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
