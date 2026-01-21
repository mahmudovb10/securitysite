const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();

async function createAdminAndUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const users = [
      {
        username: "admin",
        password: "senioradmin",
        role: "admin",
        email: "admin@system.com",
      },
      {
        username: "user1",
        password: "simple1",
        role: "user",
        email: "user1@example.com",
      },
      {
        username: "user2",
        password: "simple2",
        role: "user",
        email: "user2@example.com",
      },
      {
        username: "user3",
        password: "simple3",
        role: "user",
        email: "user3@example.com",
      },
      {
        username: "user4",
        password: "simple4",
        role: "user",
        email: "user4@example.com",
      },
      {
        username: "user5",
        password: "simple5",
        role: "user",
        email: "user5@example.com",
      },
      {
        username: "user6",
        password: "simple6",
        role: "user",
        email: "user6@example.com",
      },
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.updateOne(
        { username: u.username },
        {
          $set: {
            username: u.username,
            email: u.email, // shu qo‘shildi
            password: hashedPassword,
            role: u.role,
            status: "offline",
          },
        },
        { upsert: true },
      );

      console.log(`✅ ${u.username} created/updated`);
    }

    console.log("🎉 Admin va barcha foydalanuvchilar tayyor!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdminAndUsers();
