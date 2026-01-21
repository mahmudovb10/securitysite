const express = require("express");
const router = express.Router();
const passportController = require("../controllers/passportController");
const authenticate = require("../middleware/auth");
const upload = require("../config/multer");

// Barcha route-lar uchun authentication talab qilinadi
router.use(authenticate);

// Passport yuklash
router.post(
  "/upload",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  passportController.uploadPassportRecord,
);

// Barcha yozuvlarni olish
router.get("/records", passportController.getAllRecords);

module.exports = router;
