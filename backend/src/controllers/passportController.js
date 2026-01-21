const PassportRecord = require("../models/PassportRecord");
const File = require("../models/File");

/**
 * CREATE PASSPORT RECORD (USER OR ADMIN)
 * POST /api/passport/upload
 */
exports.uploadPassportRecord = async (req, res, next) => {
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

    // Validate file upload
    if (!req.files || (!req.files.image && !req.files.video)) {
      return res.status(400).json({
        success: false,
        error: "At least one file (image or video) must be uploaded",
      });
    }

    // Check duplicate
    const existingRecord = await PassportRecord.findOne({
      passportNumber: passportNumber.toUpperCase(),
    });

    if (existingRecord) {
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

    // Create record
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
      createdByAdmin: req.user.role === "admin",
    });

    await passportRecord.populate("createdBy", "username email role");
    await passportRecord.populate("imageFileId");
    await passportRecord.populate("videoFileId");

    res.status(201).json({
      success: true,
      message: "Record uploaded successfully",
      record: passportRecord,
    });
  } catch (error) {
    for (const filePath of savedFiles) {
      await require("fs").promises.unlink(filePath).catch(console.error);
    }
    next(error);
  }
};

/**
 * GET ALL PASSPORT RECORDS
 * GET /api/passport/records
 *
 * Returns all records from database
 * If empty, frontend shows "No data available"
 */
exports.getAllRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await PassportRecord.countDocuments();

    const records = await PassportRecord.find()
      .populate("createdBy", "username email role")
      .populate("imageFileId")
      .populate("videoFileId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
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

module.exports = exports;
