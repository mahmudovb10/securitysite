const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    passportNumber: {
      type: String,
      required: [true, "Passport number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    placeOfBirth: {
      type: String,
      required: [true, "Place of birth is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    imageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    videoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
recordSchema.index({ userId: 1, createdAt: -1 });
recordSchema.index({ passportNumber: 1 });

module.exports = mongoose.model("Record", recordSchema);

const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const authenticate = require("../middleware/auth");
const upload = require("../config/multer");

// All routes require authentication
router.use(authenticate);

// Create new record with file uploads
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  recordController.createRecord
);

// Get all records (paginated)
router.get("/", recordController.getAllRecords);

// Get single record by ID
router.get("/:id", recordController.getRecordById);

// Update record
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  recordController.updateRecord
);

// Delete record
router.delete("/:id", recordController.deleteRecord);

// Download file (secure)
router.get("/files/:fileId", recordController.downloadFile);

module.exports = router;

const Record = require("../models/Record");
const File = require("../models/File");
const fs = require("fs").promises;
const path = require("path");

/**
 * Create new record with file uploads
 * POST /api/records
 */
exports.createRecord = async (req, res, next) => {
  try {
    const {
      fullName,
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
      !fullName ||
      !passportNumber ||
      !nationality ||
      !dateOfBirth ||
      !placeOfBirth ||
      !issueDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Check if passport number already exists
    const existingRecord = await Record.findOne({ passportNumber });
    if (existingRecord) {
      return res.status(400).json({
        error: "Passport number already exists",
      });
    }

    // Handle file uploads
    let imageFileId = null;
    let videoFileId = null;

    // Process image file
    if (req.files && req.files.image) {
      const imageFile = req.files.image[0];
      const fileRecord = await File.create({
        filename: imageFile.filename,
        originalName: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        path: imageFile.path,
        fileType: "image",
        uploadedBy: req.user._id,
      });
      imageFileId = fileRecord._id;
    }

    // Process video file
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      const fileRecord = await File.create({
        filename: videoFile.filename,
        originalName: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size,
        path: videoFile.path,
        fileType: "video",
        uploadedBy: req.user._id,
      });
      videoFileId = fileRecord._id;
    }

    // Create record
    const record = await Record.create({
      userId: req.user._id,
      fullName,
      passportNumber,
      nationality,
      dateOfBirth,
      placeOfBirth,
      issueDate,
      expiryDate,
      comment,
      imageFileId,
      videoFileId,
    });

    // Populate user and file information
    await record.populate("userId", "username email");
    await record.populate("imageFileId");
    await record.populate("videoFileId");

    res.status(201).json({
      message: "Record created successfully",
      record,
    });
  } catch (error) {
    // Clean up uploaded files if record creation fails
    if (req.files) {
      if (req.files.image) {
        await fs.unlink(req.files.image[0].path).catch(console.error);
      }
      if (req.files.video) {
        await fs.unlink(req.files.video[0].path).catch(console.error);
      }
    }
    next(error);
  }
};

/**
 * Get all records with pagination
 * GET /api/records?page=1&limit=10
 */
exports.getAllRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Record.countDocuments();

    // Get records with pagination
    const records = await Record.find()
      .populate("userId", "username email")
      .populate("imageFileId")
      .populate("videoFileId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single record by ID
 * GET /api/records/:id
 */
exports.getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate("userId", "username email")
      .populate("imageFileId")
      .populate("videoFileId");

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    res.json({ record });
  } catch (error) {
    next(error);
  }
};

/**
 * Update record
 * PUT /api/records/:id
 */
exports.updateRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    // Only allow user to update their own records, unless admin
    if (
      record.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Not authorized to update this record",
      });
    }

    // Update fields
    const allowedUpdates = [
      "fullName",
      "nationality",
      "dateOfBirth",
      "placeOfBirth",
      "issueDate",
      "expiryDate",
      "comment",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    // Handle new file uploads
    if (req.files && req.files.image) {
      // Delete old image file if exists
      if (record.imageFileId) {
        const oldFile = await File.findById(record.imageFileId);
        if (oldFile) {
          await fs.unlink(oldFile.path).catch(console.error);
          await File.findByIdAndDelete(oldFile._id);
        }
      }

      // Save new image
      const imageFile = req.files.image[0];
      const fileRecord = await File.create({
        filename: imageFile.filename,
        originalName: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        path: imageFile.path,
        fileType: "image",
        uploadedBy: req.user._id,
      });
      record.imageFileId = fileRecord._id;
    }

    if (req.files && req.files.video) {
      // Delete old video file if exists
      if (record.videoFileId) {
        const oldFile = await File.findById(record.videoFileId);
        if (oldFile) {
          await fs.unlink(oldFile.path).catch(console.error);
          await File.findByIdAndDelete(oldFile._id);
        }
      }

      // Save new video
      const videoFile = req.files.video[0];
      const fileRecord = await File.create({
        filename: videoFile.filename,
        originalName: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size,
        path: videoFile.path,
        fileType: "video",
        uploadedBy: req.user._id,
      });
      record.videoFileId = fileRecord._id;
    }

    await record.save();
    await record.populate("userId", "username email");
    await record.populate("imageFileId");
    await record.populate("videoFileId");

    res.json({
      message: "Record updated successfully",
      record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete record
 * DELETE /api/records/:id
 */
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    // Only allow user to delete their own records, unless admin
    if (
      record.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Not authorized to delete this record",
      });
    }

    // Delete associated files
    if (record.imageFileId) {
      const imageFile = await File.findById(record.imageFileId);
      if (imageFile) {
        await fs.unlink(imageFile.path).catch(console.error);
        await File.findByIdAndDelete(imageFile._id);
      }
    }

    if (record.videoFileId) {
      const videoFile = await File.findById(record.videoFileId);
      if (videoFile) {
        await fs.unlink(videoFile.path).catch(console.error);
        await File.findByIdAndDelete(videoFile._id);
      }
    }

    // Delete record
    await Record.findByIdAndDelete(req.params.id);

    res.json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download file (secure with authentication)
 * GET /api/records/files/:fileId
 */
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    // Check if file exists on disk
    const filePath = path.resolve(file.path);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        error: "File not found on server",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );

    // Stream file to response
    const fileStream = require("fs").createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
