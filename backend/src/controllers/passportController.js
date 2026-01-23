const PassportRecord = require("../models/PassportRecord");
const File = require("../models/File");
const fs = require("fs").promises;
const path = require("path");

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

    // 1. Majburiy maydonlarni tekshirish
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
        error: "Barcha majburiy maydonlarni to'ldiring",
      });
    }

    // 2. Fayllar yuklanganini tekshirish
    if (!req.files || (!req.files.image && !req.files.video)) {
      return res.status(400).json({
        success: false,
        error: "Kamida bitta fayl (rasm yoki video) yuklanishi shart",
      });
    }

    // 3. Dublikat pasportni tekshirish
    const existingRecord = await PassportRecord.findOne({
      passportNumber: passportNumber.toUpperCase().trim(),
    });

    if (existingRecord) {
      // Agar bazada bo'lsa, yuklangan yangi fayllarni o'chirib tashlaymiz
      if (req.files.image)
        await fs.unlink(req.files.image[0].path).catch(console.error);
      if (req.files.video)
        await fs.unlink(req.files.video[0].path).catch(console.error);

      return res.status(400).json({
        success: false,
        error: "Ushbu pasport raqami allaqachon mavjud",
      });
    }

    // 4. Fayllarni bazaga saqlash va yo'llarni tozalash
    let imageFileId = null;
    let videoFileId = null;

    // Rasm uchun
    if (req.files.image) {
      const imageFile = req.files.image[0];
      // Yo'lni brauzer tushunadigan formatga keltiramiz
      // backend/uploads/images/file.jpg -> uploads/images/file.jpg
      const cleanPath = imageFile.path
        .replace(/\\/g, "/")
        .replace(/^.*backend\//, "");

      const imageRecord = await File.create({
        filename: imageFile.filename,
        originalName: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        path: cleanPath, // Tozalangan yo'l
        fileType: "image",
        uploadedBy: req.user._id,
      });
      imageFileId = imageRecord._id;
      savedFiles.push(imageFile.path);
    }

    // Video uchun
    if (req.files.video) {
      const videoFile = req.files.video[0];
      const cleanPath = videoFile.path
        .replace(/\\/g, "/")
        .replace(/^.*backend\//, "");

      const videoRecord = await File.create({
        filename: videoFile.filename,
        originalName: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size,
        path: cleanPath, // Tozalangan yo'l
        fileType: "video",
        uploadedBy: req.user._id,
      });
      videoFileId = videoRecord._id;
      savedFiles.push(videoFile.path);
    }

    // 5. Pasport ma'lumotlarini yaratish
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

    // Ma'lumotlarni to'ldirib qaytarish
    await passportRecord.populate("createdBy", "username email role");
    await passportRecord.populate("imageFileId");
    await passportRecord.populate("videoFileId");

    res.status(201).json({
      success: true,
      message: "Ma'lumot muvaffaqiyatli saqlandi",
      record: passportRecord,
    });
  } catch (error) {
    // Xatolik bo'lsa, yuklangan fayllarni o'chirish
    for (const filePath of savedFiles) {
      await fs.unlink(filePath).catch(console.error);
    }
    next(error);
  }
};

/**
 * GET ALL PASSPORT RECORDS
 */
exports.getAllRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Hammasini ko'rish uchun limitni oshirdik
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
