const mongoose = require("mongoose");

const passportRecordSchema = new mongoose.Schema(
  {
    // Who created this record (can be admin or user)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Passport holder information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 2,
    },
    fullName: {
      type: String,
      required: true,
    },

    // Passport details
    passportNumber: {
      type: String,
      required: [true, "Passport number is required"],
      unique: true,
      uppercase: true,
      trim: true,
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

    // Optional comment
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // File references
    imageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    videoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },

    // Track if created by admin
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
passportRecordSchema.index({ createdBy: 1, createdAt: -1 });
passportRecordSchema.index({ passportNumber: 1 }, { unique: true });

// Pre-save: Set fullName automatically
passportRecordSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

// Validation: At least one file must be present
passportRecordSchema.pre("save", function (next) {
  if (!this.imageFileId && !this.videoFileId) {
    return next(new Error("At least one file (image or video) is required"));
  }
  next();
});

module.exports = mongoose.model("PassportRecord", passportRecordSchema);
