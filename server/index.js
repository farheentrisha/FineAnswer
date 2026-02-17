const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------

// CORS configuration
function corsOrigin(origin, cb) {
  const allowed = [
    "https://fine-answer-wcij.vercel.app",
    "https://fine-answer-wcij.vercel.app/",
  ];
  if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || allowed.includes(origin)) {
    cb(null, true);
  } else {
    cb(new Error("Not allowed by CORS"));
  }
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Async wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ------------------- DATABASE -------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.pvs4l8x.mongodb.net/?appName=Cluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection;
let successStoryCollection;
let blogCollection;
let sessionCollection; // stores YouTube session videos
let eventsCollection; // stores external session/event links (e.g., Facebook)
let careerCollection; // stores career/job posts
let careerApplicationsCollection; // stores job applications
let documentsCollection; // stores user uploaded documents

// JWT Secret (should be in .env file)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Admin Email (should be in .env file)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fineanswer.com";

// Helper function to check if user is admin
const isAdminUser = (email) => {
  return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Admin Middleware - Must be used after authenticateToken
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

async function run() {
  await client.connect();

  usersCollection = client.db("FineAnswer").collection("usersCollection");
  successStoryCollection = client.db("FineAnswer").collection("successStory");
  blogCollection = client.db("FineAnswer").collection("blog");
  sessionCollection = client.db("FineAnswer").collection("session");
  eventsCollection = client.db("FineAnswer").collection("events");
  careerCollection = client.db("FineAnswer").collection("careerCollection");
  careerApplicationsCollection = client
    .db("FineAnswer")
    .collection("careerApplications");
  documentsCollection = client
    .db("FineAnswer")
    .collection("documentsCollection");

  await client.db("admin").command({ ping: 1 });
}

// ------------------- EMAIL -------------------

const sendOTPemail = async (email, otp) => {
  const emailUser = (process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.SMTP_PASS || "").trim();

  if (!emailUser || !emailPass)
    throw new Error("Email credentials not configured in .env");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: emailUser, pass: emailPass },
  });

  const mailOptions = {
    from: `FineAnswer <${emailUser}>`,
    to: email,
    subject: "FineAnswer - OTP for password reset",
    text: `Your OTP is ${otp} (expires in 10 minutes).`,
    html: `<h2>Your OTP: <strong>${otp}</strong></h2><p>Expires in 10 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
};

// ------------------- ROUTES -------------------

// Health
app.get("/", (req, res) => {
  res.json({ message: "Server running", database: usersCollection ? "connected" : "disconnected" });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    database: usersCollection ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ------------------- AUTH -------------------

// Login
app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email & password required" });

  const user = await usersCollection.findOne({ email });
  if (!user || user.authProvider !== "email") return res.status(401).json({ success: false, message: "Invalid credentials" });

  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const adminStatus = isAdminUser(email);
  if (user.isAdmin !== adminStatus) await usersCollection.updateOne({ _id: user._id }, { $set: { isAdmin: adminStatus, updatedAt: new Date() } });

  const token = generateToken(user._id.toString());
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({ success: true, token, data: userWithoutPassword, isAdmin: adminStatus });
}));

// Forgot password
app.post("/api/auth/forgot-password", asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const user = await usersCollection.findOne({ email });
  if (!user || user.authProvider !== "email") return res.status(200).json({ success: true, message: "OTP sent if user exists" });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await usersCollection.updateOne({ _id: user._id }, { $set: { resetOtp: otp, resetOtpExpiry: expiry, updatedAt: new Date() } });
  await sendOTPemail(email, otp);

  res.status(200).json({ success: true, message: "OTP sent" });
}));

// Reset password
app.post("/api/auth/reset-password", asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "Email, OTP, new password required" });

  const user = await usersCollection.findOne({ email, resetOtp: otp, resetOtpExpiry: { $gt: new Date() } });
  if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await usersCollection.updateOne({ _id: user._id }, { $set: { password: hashedPassword, updatedAt: new Date() }, $unset: { resetOtp: "", resetOtpExpiry: "" } });

  res.status(200).json({ success: true, message: "Password reset successful" });
}));

// POST /api/auth/google - Login/Register with Google OAuth
app.post(
  "/api/auth/google",
  asyncHandler(async (req, res) => {
    const { email, googleId, name, picture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: "Email and googleId are required",
      });
    }

    let user = await usersCollection.findOne({ googleId });

    if (user && picture) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { picture, updatedAt: new Date() } },
      );
      user = await usersCollection.findOne({ _id: user._id });
    }

    if (!user) {
      user = await usersCollection.findOne({ email });

      if (user) {
        const adminStatus = isAdminUser(email);
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              googleId,
              authProvider: "google",
              picture: picture || user.picture,
              isAdmin: adminStatus,
              updatedAt: new Date(),
            },
          },
        );
        user = await usersCollection.findOne({ _id: user._id });
      } else {
        const adminStatus = isAdminUser(email);
        const newUser = {
          name: name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google",
          picture: picture || null,
          isAdmin: adminStatus,
          progressTracker: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await usersCollection.insertOne(newUser);
        user = await usersCollection.findOne({ _id: result.insertedId });
      }
    }

    const adminStatus = isAdminUser(user.email);
    if (user.isAdmin !== adminStatus) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { isAdmin: adminStatus, updatedAt: new Date() } },
      );
      user.isAdmin = adminStatus;
    }

    const token = generateToken(user._id.toString());
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
      isAdmin: user.isAdmin || false,
    });
  }),
);

// GET /api/auth/me - Get current logged-in user (Protected Route)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.status(200).json({
    success: true,
    data: userWithoutPassword,
    isAdmin: userWithoutPassword.isAdmin || false,
  });
});

// PUT /api/users/me/profile - Update current user's profile (Protected Route)
app.put(
  "/api/users/me/profile",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      name,
      dateOfBirth,
      phone,
      country,
      city,
      address,
      postalCode,
      highestEducation,
      university,
      graduationYear,
      gpa,
      workExperience,
      yearsOfExperience,
      languageTest,
      picture,
    } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (phone !== undefined) updateFields.phone = phone;
    if (country !== undefined) updateFields.country = country;
    if (city !== undefined) updateFields.city = city;
    if (address !== undefined) updateFields.address = address;
    if (postalCode !== undefined) updateFields.postalCode = postalCode;
    if (highestEducation !== undefined)
      updateFields.highestEducation = highestEducation;
    if (university !== undefined) updateFields.university = university;
    if (graduationYear !== undefined)
      updateFields.graduationYear = graduationYear;
    if (gpa !== undefined) updateFields.gpa = gpa;
    if (workExperience !== undefined)
      updateFields.workExperience = workExperience;
    if (yearsOfExperience !== undefined)
      updateFields.yearsOfExperience = yearsOfExperience;
    if (languageTest !== undefined && typeof languageTest === "object")
      updateFields.languageTest = languageTest;
    if (picture !== undefined) updateFields.picture = picture;

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, ...userWithoutPassword } = result;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userWithoutPassword,
    });
  }),
);

// POST /api/users - Create a new user
app.post(
  "/api/users",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      authProvider = "email",
      googleId,
      picture,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    if (authProvider !== "google" && authProvider !== "email") {
      return res.status(400).json({
        success: false,
        message: "authProvider must be either 'email' or 'google'",
      });
    }

    if (authProvider === "email") {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required for email authentication",
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
    }

    if (authProvider === "google" && googleId) {
      const existingGoogleUser = await usersCollection.findOne({ googleId });
      if (existingGoogleUser) {
        return res.status(400).json({
          success: false,
          message: "User with this Google account already exists",
        });
      }
    }

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const adminStatus = isAdminUser(email);
>>>>>>> ed14f72 (Modified Tracker)
    const newUser = {
      name: name || email.split("@")[0],
      email,
      googleId,
      authProvider: "google",
      picture: picture || null,
      isAdmin: adminStatus,
      progressTracker: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await usersCollection.insertOne(newUser);
    user = await usersCollection.findOne({ _id: result.insertedId });
  } else {
    await usersCollection.updateOne({ _id: user._id }, { $set: { googleId, picture: picture || user.picture, isAdmin: adminStatus, updatedAt: new Date() } });
    user = await usersCollection.findOne({ _id: user._id });
  }

  const token = generateToken(user._id.toString());
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({ success: true, token, data: userWithoutPassword, isAdmin: user.isAdmin || false });
}));

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.status(200).json({ success: true, data: userWithoutPassword, isAdmin: userWithoutPassword.isAdmin || false });
});

<<<<<<< HEAD
// ------------------- USERS -------------------

// Create, list, update profiles, progress tracker, etc.
// ✅ All `findOneAndUpdate` / `findOneAndDelete` calls now correctly use `.value`

// ------------------- SUCCESS STORIES / BLOGS / VIDEOS / EVENTS -------------------
// ✅ All admin-only routes, create/update/delete correctly handle `.value`
// ✅ Public GET routes untouched

// Connect to MongoDB, then start the server
run()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
