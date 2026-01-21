const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");

    // DO NOT SEED ANY DATA
    // Database starts completely empty
    // Only real user uploads will create data
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;

// ============================================
// CRITICAL: NO SEED SCRIPT
// ============================================

/*
IMPORTANT NOTES:

1. NO DEMO DATA
   - No seed.js file
   - No initial data creation
   - Database starts completely empty

2. FIRST ADMIN USER
   - Create manually via registration
   - Or use separate admin creation script
   - Run ONCE in production setup only

3. DATA CREATION FLOW
   User Registration → Empty Database
   User Login → No records shown
   User Uploads → First record appears
   Admin Login → Can see all records (if any exist)

4. EMPTY STATE HANDLING
   - Frontend checks: records.length === 0
   - Display: "No data available"
   - No placeholders, no mock cards

5. STATUS TRACKING
   - User logs in → status = 'online'
   - User logs out → status = 'offline'
   - Activity tracking → updates lastActiveTime
   - Auto-offline after 10 minutes of inactivity
*/

// ============================================
// OPTIONAL: CREATE FIRST ADMIN USER (RUN ONCE)
// File: backend/src/scripts/createAdmin.js
// ============================================

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createFirstAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: "admin",
      email: "admin@system.com",
      password: "admin123", // Change this in production!
      role: "admin",
      status: "offline",
    });

    console.log("✅ Admin user created successfully");
    console.log("Username:", admin.username);
    console.log("Password: admin123");
    console.log("⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

// Run: node backend/src/scripts/createAdmin.js
// createFirstAdmin();

// ============================================
// DATA RULES SUMMARY
// ============================================

/*
✅ ALLOWED:
- Real user uploads
- Admin uploads
- Data saved after validation

❌ NOT ALLOWED:
- Demo data
- Mock data
- Seed data
- Placeholder data
- Test data in production

EMPTY STATE:
- Database starts empty
- Show "No data available"
- First upload creates first record

STATUS TRACKING:
- Online: User logged in and active
- Offline: User logged out or inactive > 10 min
- Updates on every authenticated request

ADMIN PRIVILEGES:
- Can create passport records
- Can delete ANY passport record
- Can view all statistics
- Can manage all users

USER PRIVILEGES:
- Can create passport records
- Can view all passport records
- CANNOT delete records
- CANNOT access admin panel
*/
