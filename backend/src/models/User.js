const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },

    // ONLINE/OFFLINE STATUS TRACKING
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
    lastLoginTime: {
      type: Date,
      default: null,
    },
    lastLogoutTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set user online
userSchema.methods.setOnline = function () {
  this.status = "online";
  this.lastActiveTime = Date.now();
  this.lastLoginTime = Date.now();
  return this.save();
};

// Set user offline
userSchema.methods.setOffline = function () {
  this.status = "offline";
  this.lastLogoutTime = Date.now();
  return this.save();
};

// Update activity (keeps user online)
userSchema.methods.updateActivity = function () {
  this.lastActiveTime = Date.now();
  if (this.status === "offline") {
    this.status = "online";
  }
  return this.save();
};

// Check if user is truly online (active within last 10 minutes)
userSchema.methods.isReallyOnline = function () {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return (
    this.status === "online" &&
    new Date(this.lastActiveTime).getTime() > tenMinutesAgo
  );
};

module.exports = mongoose.model("User", userSchema);
