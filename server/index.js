const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Allow all origins in development
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wraps async route handlers so rejected promises are passed to the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.pvs4l8x.mongodb.net/?appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and collection references
let usersCollection;
let successStoryCollection;

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
    // Check database connection first
    if (!usersCollection) {
      return res.status(503).json({
        success: false,
        message: "Database connection not established. Please try again.",
      });
    }

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
  try {
    // Connect the client to the server
    await client.connect();

    // Collections
    usersCollection = client.db("FineAnswer").collection("usersCollection");
    successStoryCollection = client.db("FineAnswer").collection("successStory");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
  } catch (_error) {
    // Connection errors surface via health check / routes
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Running Bhaai Running",
    status: "ok",
    database: usersCollection ? "connected" : "disconnected",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    database: usersCollection ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// POST /api/auth/login - Login with email and password
app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.authProvider !== "email") {
      return res.status(400).json({
        success: false,
        message:
          "This email is registered with Google. Please use Google login.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
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

// Helper: Send OTP email (uses SMTP_USER / SMTP_PASS or EMAIL_USER / EMAIL_PASS from .env)
const sendOTPemail = async (email, otp) => {
  const emailUser = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s/g, "");
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials not configured. Add SMTP_USER and SMTP_PASS to .env");
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: emailUser, pass: emailPass },
  });
  const mailOptions = {
    from: process.env.SMTP_FROM || `FineAnswer <${emailUser}>`,
    to: email,
    subject: "FineAnswer - Your OTP for password reset",
    text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
    html: `
      <h1 style="color: #2c3e50;">Hello</h1>
      <h2>Your OTP for password reset: <strong>${otp}</strong></h2>
      <p>Please use this OTP to reset your password.</p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Team FineAnswer</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// POST /api/auth/forgot-password - Request password reset (sends OTP via email)
app.post(
  "/api/auth/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const successResponse = {
      success: true,
      message: "If an account exists with this email, you will receive an OTP shortly.",
      redirectTo: `/reset-password?email=${encodeURIComponent(email)}`,
    };

    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(200).json(successResponse);
    if (user.authProvider !== "email" || !user.password) {
      return res.status(200).json({
        success: true,
        googleAccount: true,
        message: "This account uses Google Sign-In. To change your password, go to your Google Account settings (myaccount.google.com).",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { resetOtp: otp, resetOtpExpiry, updatedAt: new Date() } }
    );

    try {
      await sendOTPemail(email, otp);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again or contact support. Check server logs for details.",
      });
    }
    res.status(200).json(successResponse);
  }),
);

// POST /api/auth/reset-password - Reset password with OTP (from email)
app.post(
  "/api/auth/reset-password",
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await usersCollection.findOne({
      email,
      resetOtp: otp,
      resetOtpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
        $unset: { resetOtp: "", resetOtpExpiry: "" },
      },
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  }),
);

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
    const newUser = {
      name,
      email,
      authProvider,
      isAdmin: adminStatus,
      progressTracker: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (authProvider === "google") {
      if (phone) newUser.phone = phone;
      if (googleId) newUser.googleId = googleId;
      if (picture) newUser.picture = picture;
    } else {
      if (phone) newUser.phone = phone;
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
    }

    const result = await usersCollection.insertOne(newUser);
    const user = await usersCollection.findOne({ _id: result.insertedId });
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      isAdmin: user.isAdmin || false,
      data: userWithoutPassword,
    });
  }),
);

// GET /api/users - Get all users (ADMIN ONLY)
app.get(
  "/api/users",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await usersCollection.find({}).toArray();
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.status(200).json({
      success: true,
      users: usersWithoutPassword,
    });
  }),
);

// GET /api/users/google/:googleId - Get a user by Google ID
app.get(
  "/api/users/google/:googleId",
  asyncHandler(async (req, res) => {
    const { googleId } = req.params;
    const user = await usersCollection.findOne({ googleId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  }),
);

// GET /api/users/email/:email - Get a user by email
app.get(
  "/api/users/email/:email",
  asyncHandler(async (req, res) => {
    const { email } = req.params;
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  }),
);

// GET /api/users/:id - Get a single user by ID
app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  }),
);

// ==================== PROGRESS TRACKER ROUTES ====================

// GET /api/users/me/progress-tracker - Get own progress tracker (USER - Any authenticated user)
// IMPORTANT: This route must be defined BEFORE /api/users/:userId/progress-tracker
app.get(
  "/api/users/me/progress-tracker",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await usersCollection.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      timeline: user.progressTracker || [],
    });
  }),
);

// GET /api/users/:userId/progress-tracker - Get user's progress tracker (ADMIN ONLY)
app.get(
  "/api/users/:userId/progress-tracker",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      timeline: user.progressTracker || [],
    });
  }),
);

// PUT /api/users/:userId/progress-tracker - Update user's progress tracker (ADMIN ONLY)
app.put(
  "/api/users/:userId/progress-tracker",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { timeline } = req.body;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }
    if (!Array.isArray(timeline)) {
      return res.status(400).json({
        message: "Timeline must be an array",
      });
    }
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          progressTracker: timeline,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    if (!result) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "Progress tracker updated successfully",
      user: {
        _id: result._id,
        progressTracker: result.progressTracker,
      },
    });
  }),
);

// ==================== SUCCESS STORIES ROUTES ====================

// GET /api/success-stories - Get all success stories (PUBLIC)
app.get(
  "/api/success-stories",
  asyncHandler(async (req, res) => {
    const stories = await successStoryCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(stories);
  }),
);

// POST /api/success-stories - Create a new success story (ADMIN ONLY)
app.post(
  "/api/success-stories",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, university, country, program, story, image } = req.body;
    if (!name || !university || !country || !program || !story || !image) {
      return res.status(400).json({
        message:
          "Name, university, country, program, story, and image are required",
      });
    }
    try {
      new URL(image);
    } catch (_urlError) {
      return res.status(400).json({
        message: "Invalid image URL format",
      });
    }
    const newStory = {
      name: name.trim(),
      university: university.trim(),
      country: country.trim(),
      program: program.trim(),
      story: story.trim(),
      image: image.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await successStoryCollection.insertOne(newStory);
    const savedStory = await successStoryCollection.findOne({
      _id: result.insertedId,
    });
    res.status(201).json({
      message: "Success story created successfully",
      story: savedStory,
    });
  }),
);

// DELETE /api/success-stories/:id - Delete a success story (ADMIN ONLY)
app.delete(
  "/api/success-stories/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid success story ID format",
      });
    }
    const deletedStory = await successStoryCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedStory) {
      return res.status(404).json({
        message: "Success story not found",
      });
    }
    res.status(200).json({
      message: "Success story deleted successfully",
    });
  }),
);

// Global error handler (catches errors from asyncHandler-wrapped routes)
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: err.message,
  });
});

// Connect to MongoDB, then start the server (so usersCollection is set before any request)
run()
  .then(() => {
    app.listen(port, () => {
      // Server started on port
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
