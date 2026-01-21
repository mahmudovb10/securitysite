const mongoose = require("mongoose");
const User = require("../models/User");
const Record = require("../models/Record");
const File = require("../models/File");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    await File.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create Admin User
    const admin = await User.create({
      username: "admin",
      email: "admin@system.com",
      password: "admin123",
      role: "admin",
      lastActiveTime: new Date(),
    });
    console.log("✅ Admin user created");

    // Create 6 Regular Users
    const users = [];
    for (let i = 1; i <= 6; i++) {
      const user = await User.create({
        username: `user${i}`,
        email: `user${i}@system.com`,
        password: "user123",
        role: "user",
        lastActiveTime:
          i % 2 === 0 ? new Date() : new Date(Date.now() - 1000 * 60 * 20),
      });
      users.push(user);
      console.log(`✅ User ${i} created`);
    }

    // Create sample records for users
    const sampleRecords = [
      {
        userId: users[0]._id,
        fullName: "John Michael Doe",
        passportNumber: "US12345678",
        nationality: "United States",
        dateOfBirth: new Date("1990-05-15"),
        placeOfBirth: "New York, USA",
        issueDate: new Date("2020-01-10"),
        expiryDate: new Date("2030-01-10"),
        comment:
          "Regular passport renewal. All documents verified and approved.",
      },
      {
        userId: users[1]._id,
        fullName: "Jane Elizabeth Smith",
        passportNumber: "GB87654321",
        nationality: "United Kingdom",
        dateOfBirth: new Date("1985-08-22"),
        placeOfBirth: "London, UK",
        issueDate: new Date("2019-06-15"),
        expiryDate: new Date("2029-06-15"),
        comment:
          "First-time passport application. Standard processing completed.",
      },
      {
        userId: users[2]._id,
        fullName: "Carlos Rodriguez Garcia",
        passportNumber: "ES55667788",
        nationality: "Spain",
        dateOfBirth: new Date("1992-03-10"),
        placeOfBirth: "Madrid, Spain",
        issueDate: new Date("2021-09-20"),
        expiryDate: new Date("2031-09-20"),
        comment:
          "Emergency passport issuance. Previous passport lost during travel.",
      },
      {
        userId: users[3]._id,
        fullName: "Yuki Tanaka",
        passportNumber: "JP99887766",
        nationality: "Japan",
        dateOfBirth: new Date("1988-12-05"),
        placeOfBirth: "Tokyo, Japan",
        issueDate: new Date("2018-04-12"),
        expiryDate: new Date("2028-04-12"),
        comment: "Passport renewal for business travel purposes.",
      },
      {
        userId: users[4]._id,
        fullName: "Emma Charlotte Wilson",
        passportNumber: "CA11223344",
        nationality: "Canada",
        dateOfBirth: new Date("1995-07-18"),
        placeOfBirth: "Toronto, Canada",
        issueDate: new Date("2022-02-28"),
        expiryDate: new Date("2032-02-28"),
        comment: "New passport issued after name change following marriage.",
      },
      {
        userId: users[5]._id,
        fullName: "Ahmed Hassan Mohammed",
        passportNumber: "EG33445566",
        nationality: "Egypt",
        dateOfBirth: new Date("1987-11-30"),
        placeOfBirth: "Cairo, Egypt",
        issueDate: new Date("2020-08-05"),
        expiryDate: new Date("2030-08-05"),
        comment:
          "Passport issued with extended validity for diplomatic missions.",
      },
    ];

    for (const recordData of sampleRecords) {
      await Record.create(recordData);
    }
    console.log("✅ Sample records created");

    console.log("\n==========================================");
    console.log("✅ Database seeding completed successfully!");
    console.log("==========================================\n");
    console.log("Login Credentials:");
    console.log("------------------");
    console.log("Admin:");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("\nUsers (1-6):");
    console.log("  Username: user1 through user6");
    console.log("  Password: user123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();

// ============================================
// API ENDPOINTS DOCUMENTATION
// ============================================

/*

==============================================
API ENDPOINTS DOCUMENTATION
==============================================

BASE URL: http://localhost:5000/api

==============================================
AUTHENTICATION ENDPOINTS
==============================================

1. Register New User
   POST /auth/register
   Body: {
     "username": "string",
     "email": "string",
     "password": "string",
     "role": "user" | "admin" (optional)
   }
   Response: { token, user }

2. Login
   POST /auth/login
   Body: {
     "username": "string",
     "password": "string"
   }
   Response: { token, user }

3. Get Current User
   GET /auth/me
   Headers: Authorization: Bearer <token>
   Response: { user }

4. Logout
   POST /auth/logout
   Headers: Authorization: Bearer <token>
   Response: { message }

5. Change Password
   PUT /auth/change-password
   Headers: Authorization: Bearer <token>
   Body: {
     "currentPassword": "string",
     "newPassword": "string"
   }
   Response: { message }

==============================================
USER ENDPOINTS (Authenticated)
==============================================

6. Get User Profile
   GET /users/profile
   Headers: Authorization: Bearer <token>
   Response: { user }

7. Update User Profile
   PUT /users/profile
   Headers: Authorization: Bearer <token>
   Body: {
     "username": "string",
     "email": "string"
   }
   Response: { message, user }

8. Get All Users
   GET /users
   Headers: Authorization: Bearer <token>
   Response: { users: [] }

==============================================
RECORD ENDPOINTS (Authenticated)
==============================================

9. Create Record
   POST /records
   Headers: Authorization: Bearer <token>
   Content-Type: multipart/form-data
   Body: FormData {
     "fullName": "string",
     "passportNumber": "string",
     "nationality": "string",
     "dateOfBirth": "YYYY-MM-DD",
     "placeOfBirth": "string",
     "issueDate": "YYYY-MM-DD",
     "expiryDate": "YYYY-MM-DD",
     "comment": "string" (optional),
     "image": File (optional),
     "video": File (optional)
   }
   Response: { message, record }

10. Get All Records (Paginated)
    GET /records?page=1&limit=10
    Headers: Authorization: Bearer <token>
    Response: { records: [], pagination: {} }

11. Get Record by ID
    GET /records/:id
    Headers: Authorization: Bearer <token>
    Response: { record }

12. Update Record
    PUT /records/:id
    Headers: Authorization: Bearer <token>
    Content-Type: multipart/form-data
    Body: FormData (same as create)
    Response: { message, record }
    Note: Users can only update their own records unless admin

13. Delete Record
    DELETE /records/:id
    Headers: Authorization: Bearer <token>
    Response: { message }
    Note: Users can only delete their own records unless admin

14. Download File
    GET /records/files/:fileId
    Headers: Authorization: Bearer <token>
    Response: File download

==============================================
ADMIN ENDPOINTS (Admin Only)
==============================================

15. Get Dashboard Statistics
    GET /admin/dashboard
    Headers: Authorization: Bearer <token>
    Response: {
      stats: {
        totalUsers,
        onlineUsers,
        offlineUsers,
        totalRecords,
        totalFiles,
        totalStorage
      },
      recentRecords: []
    }

16. Get All Users (Admin)
    GET /admin/users?page=1&limit=20
    Headers: Authorization: Bearer <token>
    Response: { users: [], pagination: {} }

17. Get User by ID (Admin)
    GET /admin/users/:id
    Headers: Authorization: Bearer <token>
    Response: { user, records: [] }

18. Update User (Admin)
    PUT /admin/users/:id
    Headers: Authorization: Bearer <token>
    Body: {
      "role": "admin" | "user",
      "username": "string",
      "email": "string"
    }
    Response: { message, user }

19. Delete User (Admin)
    DELETE /admin/users/:id
    Headers: Authorization: Bearer <token>
    Response: { message }
    Note: Deletes user and all associated records/files

20. Get All Records (Admin)
    GET /admin/records?page=1&limit=20
    Headers: Authorization: Bearer <token>
    Response: { records: [], pagination: {} }

21. Get Online Users
    GET /admin/stats/online-users
    Headers: Authorization: Bearer <token>
    Response: { total, users: [] }

22. Get Records Statistics
    GET /admin/stats/records
    Headers: Authorization: Bearer <token>
    Response: { total, byUser: [] }

==============================================
ERROR RESPONSES
==============================================

All endpoints return error responses in format:
{
  "error": "Error message",
  "details": [] (optional, for validation errors)
}

Common Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (no token or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

==============================================
FILE UPLOAD CONSTRAINTS
==============================================

- Maximum file size: 10MB
- Allowed image types: JPEG, PNG, GIF, WEBP
- Allowed video types: MP4, MPEG, MOV, AVI
- Files are stored in /uploads directory
- File access requires authentication
- Files are NOT accessible via direct URL

==============================================
AUTHENTICATION FLOW
==============================================

1. User registers or logs in
2. Server returns JWT token
3. Client stores token (localStorage/sessionStorage)
4. Client includes token in Authorization header for all requests:
   Authorization: Bearer <token>
5. Server validates token and returns data
6. Token expires after 7 days (configurable)

==============================================
ROLE-BASED ACCESS CONTROL
==============================================

User Permissions:
- View all records from all users
- Create own records
- Update own records
- Delete own records
- Download any files
- View other users' public info

Admin Permissions:
- All user permissions
- View admin dashboard
- View detailed user information
- Update any user's role/info
- Delete any user
- Delete any record
- View system statistics

==============================================
ONLINE/OFFLINE STATUS
==============================================

- User is considered online if lastActiveTime < 10 minutes ago
- lastActiveTime updated on:
  - Login
  - Any authenticated API call
  - Automatic heartbeat (every minute)

==============================================

*/
