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

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fine-answer-wcij.vercel.app",
      "https://fine-answer-wcij.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wraps async route handlers so rejected promises are passed to the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// MongoDB: use MONGODB_URI if set (paste full string from Atlas), else build from DB_USER/DB_PASSWORD
const dbUser = (process.env.DB_USER || "").trim();
const dbPassword = (process.env.DB_PASSWORD || "").trim();
const defaultHost = "cluster1.pvs4l8x.mongodb.net";
const uri =
  (process.env.MONGODB_URI || "").trim() ||
  `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${defaultHost}/?appName=Cluster1`;

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
let blogCollection;
let sessionCollection; // stores YouTube session videos
let eventsCollection; // stores external session/event links (e.g., Facebook)
let careerCollection; // stores career/job posts
let careerApplicationsCollection; // stores job applications
let documentsCollection; // stores user uploaded documents
let paymentCollection; // stores payment records (pending → success/fail/cancel)

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
    // await client.connect();

    // Collections Initialize
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
    paymentCollection = client.db("FineAnswer").collection("paymentCollection");


    // API's Start From Here=====>>>>>
    // ========================================================

    // Health check endpoint
    // app.get("/api/health", (req, res) => {
    //   res.json({
    //     success: true,
    //     status: "ok",
    //     database: usersCollection ? "connected" : "disconnected",
    //     timestamp: new Date().toISOString(),
    //   });
    // });

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
      const emailUser = (
        process.env.SMTP_USER ||
        process.env.EMAIL_USER ||
        ""
      ).trim();
      const emailPass = (
        process.env.SMTP_PASS ||
        process.env.EMAIL_PASS ||
        ""
      ).replace(/\s/g, "");
      if (!emailUser || !emailPass) {
        throw new Error(
          "Email credentials not configured. Add SMTP_USER and SMTP_PASS to .env",
        );
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
          return res
            .status(400)
            .json({ success: false, message: "Email is required" });
        }

        const successResponse = {
          success: true,
          message:
            "If an account exists with this email, you will receive an OTP shortly.",
          redirectTo: `/reset-password?email=${encodeURIComponent(email)}`,
        };

        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(200).json(successResponse);
        if (user.authProvider !== "email" || !user.password) {
          return res.status(200).json({
            success: true,
            googleAccount: true,
            message:
              "This account uses Google Sign-In. To change your password, go to your Google Account settings (myaccount.google.com).",
          });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
        const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { resetOtp: otp, resetOtpExpiry, updatedAt: new Date() } },
        );

        try {
          await sendOTPemail(email, otp);
        } catch (err) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to send email. Please try again or contact support. Check server logs for details.",
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
          message:
            "Password reset successful. You can now log in with your new password.",
        });
      }),
    );

    // POST /api/auth/google - Login/Register with Google OAuth
    app.post(
      "/api/auth/google",
      asyncHandler(async (req, res) => {
        if (!usersCollection) {
          return res.status(503).json({
            success: false,
            message:
              "Database is not connected. Please check server configuration and try again.",
          });
        }

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

    // POST /api/send-message - Dashboard "Send a Message" form → email to FineAnswer
    const MESSAGE_TO_EMAIL =
      process.env.MESSAGE_TO_EMAIL || "fineanswer2025@gmail.com";
    const isValidEmailFormat = (email) => {
      if (!email || typeof email !== "string") return false;
      const trimmed = email.trim().toLowerCase();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
    };

    app.post(
      "/api/send-message",
      asyncHandler(async (req, res) => {
        const {
          name,
          email,
          phone,
          lastEducation,
          preferredCountry,
          appointmentDate,
          message,
        } = req.body;
        if (!name || !(name + "").trim()) {
          return res.status(400).json({
            success: false,
            message: "Name is required",
          });
        }
        if (!email || !(email + "").trim()) {
          return res.status(400).json({
            success: false,
            message: "Email is required",
          });
        }
        const emailNormalized = (email + "").trim().toLowerCase();
        if (!isValidEmailFormat(emailNormalized)) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
          });
        }
        if (!message || !(message + "").trim()) {
          return res.status(400).json({
            success: false,
            message: "Message is required",
          });
        }
        const emailUser = (process.env.SMTP_USER || "").trim();
        const emailPass = (process.env.SMTP_PASS || "").replace(/\s/g, "");
        if (!emailUser || !emailPass) {
          return res.status(503).json({
            success: false,
            message: "Email service not configured",
          });
        }
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          requireTLS: true,
          auth: { user: emailUser, pass: emailPass },
        });
        const text = [
          `Name: ${name}`,
          `Email (reply to): ${emailNormalized}`,
          phone ? `Phone: ${phone}` : null,
          lastEducation ? `Last Education: ${lastEducation}` : null,
          preferredCountry ? `Preferred Country: ${preferredCountry}` : null,
          appointmentDate ? `Appointment Date: ${appointmentDate}` : null,
          "",
          "Message:",
          message,
        ]
          .filter(Boolean)
          .join("\n");
        const html = `
          <h2>New message from FineAnswer dashboard</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email (reply to):</strong> <a href="mailto:${emailNormalized}">${emailNormalized}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${lastEducation ? `<p><strong>Last Education:</strong> ${lastEducation}</p>` : ""}
          ${preferredCountry ? `<p><strong>Preferred Country:</strong> ${preferredCountry}</p>` : ""}
          ${appointmentDate ? `<p><strong>Appointment Date:</strong> ${appointmentDate}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${(message || "").replace(/\n/g, "<br>")}</p>
        `;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `FineAnswer <${emailUser}>`,
          to: MESSAGE_TO_EMAIL,
          replyTo: emailNormalized,
          subject: `FineAnswer: Message from ${name} (${emailNormalized})`,
          text,
          html,
        });
        res.status(200).json({
          success: true,
          message: "Your message has been sent successfully.",
        });
      })
    );

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
          const existingGoogleUser = await usersCollection.findOne({
            googleId,
          });
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
        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
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

    // ==================== BLOG ENDPOINTS ====================

    // GET /api/blogs - Get all blog posts (Public)
    app.get(
      "/api/blogs",
      asyncHandler(async (req, res) => {
        const blogs = await blogCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json({
          success: true,
          data: blogs,
        });
      }),
    );

    // GET /api/blogs/:id - Get a single blog post (Public)
    app.get(
      "/api/blogs/:id",
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid blog ID format",
          });
        }
        const blog = await blogCollection.findOne({ _id: new ObjectId(id) });
        if (!blog) {
          return res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
        }
        res.status(200).json({
          success: true,
          data: blog,
        });
      }),
    );

    // POST /api/blogs - Create a new blog post (ADMIN ONLY)
    app.post(
      "/api/blogs",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { title, content, image, author } = req.body;

        if (!title || !content) {
          return res.status(400).json({
            success: false,
            message: "Title and content are required",
          });
        }

        const newBlog = {
          title: title.trim(),
          content: content.trim(),
          image: image || null,
          author: author || req.user.name || "Admin",
          authorId: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await blogCollection.insertOne(newBlog);
        const savedBlog = await blogCollection.findOne({
          _id: result.insertedId,
        });

        res.status(201).json({
          success: true,
          message: "Blog post created successfully",
          data: savedBlog,
        });
      }),
    );

    // PUT /api/blogs/:id - Update a blog post (ADMIN ONLY)
    app.put(
      "/api/blogs/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid blog ID format",
          });
        }

        const { title, content, image, author } = req.body;
        const updateFields = { updatedAt: new Date() };

        if (title) updateFields.title = title.trim();
        if (content) updateFields.content = content.trim();
        if (image !== undefined) updateFields.image = image;
        if (author) updateFields.author = author.trim();

        const updatedBlog = await blogCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: "after" },
        );

        if (!updatedBlog) {
          return res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Blog post updated successfully",
          data: updatedBlog,
        });
      }),
    );

    // DELETE /api/blogs/:id - Delete a blog post (ADMIN ONLY)
    app.delete(
      "/api/blogs/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid blog ID format",
          });
        }

        const deletedBlog = await blogCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!deletedBlog) {
          return res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Blog post deleted successfully",
        });
      }),
    );

    // ==================== VIDEO ENDPOINTS ====================

    // Helper function to extract YouTube video ID from various URL formats
    const extractYouTubeVideoId = (url) => {
      if (!url) return null;

      // Standard format: https://www.youtube.com/watch?v=VIDEO_ID
      let match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
      );
      if (match) return match[1];

      // Embedded format: https://www.youtube.com/embed/VIDEO_ID
      match = url.match(/youtube\.com\/embed\/([^&\?\/]+)/);
      if (match) return match[1];

      // Short format: https://youtu.be/VIDEO_ID
      match = url.match(/youtu\.be\/([^&\?\/]+)/);
      if (match) return match[1];

      return null;
    };

    // GET /api/videos - Get all videos (Public)
    app.get(
      "/api/videos",
      asyncHandler(async (req, res) => {
        const videos = await sessionCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json({
          success: true,
          data: videos,
        });
      }),
    );

    // GET /api/videos/:id - Get a single video (Public)
    app.get(
      "/api/videos/:id",
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid video ID format",
          });
        }
        const video = await sessionCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!video) {
          return res.status(404).json({
            success: false,
            message: "Video not found",
          });
        }
        res.status(200).json({
          success: true,
          data: video,
        });
      }),
    );

    // POST /api/videos - Create a new video (ADMIN ONLY)
    app.post(
      "/api/videos",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { title, youtubeUrl, description } = req.body;

        if (!title || !youtubeUrl) {
          return res.status(400).json({
            success: false,
            message: "Title and YouTube URL are required",
          });
        }

        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid YouTube URL. Please provide a valid YouTube video link.",
          });
        }

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        const newVideo = {
          title: title.trim(),
          youtubeUrl: youtubeUrl.trim(),
          youtubeVideoId: videoId,
          thumbnailUrl,
          description: description?.trim() || "",
          createdBy: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await sessionCollection.insertOne(newVideo);
        const savedVideo = await sessionCollection.findOne({
          _id: result.insertedId,
        });

        res.status(201).json({
          success: true,
          message: "Video added successfully",
          data: savedVideo,
        });
      }),
    );

    // PUT /api/videos/:id - Update a video (ADMIN ONLY)
    app.put(
      "/api/videos/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid video ID format",
          });
        }

        const { title, youtubeUrl, description } = req.body;
        const updateFields = { updatedAt: new Date() };

        if (title) updateFields.title = title.trim();
        if (description !== undefined)
          updateFields.description = description?.trim() || "";

        if (youtubeUrl) {
          const videoId = extractYouTubeVideoId(youtubeUrl);
          if (!videoId) {
            return res.status(400).json({
              success: false,
              message: "Invalid YouTube URL",
            });
          }
          updateFields.youtubeUrl = youtubeUrl.trim();
          updateFields.youtubeVideoId = videoId;
          updateFields.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }

        const updatedVideo = await sessionCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: "after" },
        );

        if (!updatedVideo) {
          return res.status(404).json({
            success: false,
            message: "Video not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Video updated successfully",
          data: updatedVideo,
        });
      }),
    );

    // DELETE /api/videos/:id - Delete a video (ADMIN ONLY)
    app.delete(
      "/api/videos/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid video ID format",
          });
        }

        const deletedVideo = await sessionCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!deletedVideo) {
          return res.status(404).json({
            success: false,
            message: "Video not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Video deleted successfully",
        });
      }),
    );

    // GET /api/events - Get all external session events (Public)
    app.get(
      "/api/events",
      asyncHandler(async (req, res) => {
        const events = await eventsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json({
          success: true,
          data: events,
        });
      }),
    );

    // POST /api/events - Create a new event (ADMIN ONLY)
    app.post(
      "/api/events",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { title, eventUrl, description } = req.body;

        if (!title || !eventUrl) {
          return res.status(400).json({
            success: false,
            message: "Title and event URL are required",
          });
        }

        const newEvent = {
          title: title.trim(),
          eventUrl: eventUrl.trim(),
          description: description?.trim() || "",
          createdBy: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await eventsCollection.insertOne(newEvent);
        const savedEvent = await eventsCollection.findOne({
          _id: result.insertedId,
        });

        res.status(201).json({
          success: true,
          message: "Event added successfully",
          data: savedEvent,
        });
      }),
    );

    // PUT /api/events/:id - Update an event (ADMIN ONLY)
    app.put(
      "/api/events/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid event ID format",
          });
        }

        const { title, eventUrl, description } = req.body;
        const updateFields = { updatedAt: new Date() };

        if (title) updateFields.title = title.trim();
        if (description !== undefined)
          updateFields.description = description?.trim() || "";
        if (eventUrl) updateFields.eventUrl = eventUrl.trim();

        const updatedEvent = await eventsCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: "after" },
        );

        if (!updatedEvent) {
          return res.status(404).json({
            success: false,
            message: "Event not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Event updated successfully",
          data: updatedEvent,
        });
      }),
    );

    // DELETE /api/events/:id - Delete an event (ADMIN ONLY)
    app.delete(
      "/api/events/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid event ID format",
          });
        }

        const deletedEvent = await eventsCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!deletedEvent) {
          return res.status(404).json({
            success: false,
            message: "Event not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Event deleted successfully",
        });
      }),
    );

    // GET /api/jobs - Public list of job posts (Career)
    app.get(
      "/api/jobs",
      asyncHandler(async (req, res) => {
        const jobs = await careerCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json({
          success: true,
          data: jobs,
        });
      }),
    );

    // GET /api/jobs/:id - Single job (Public)
    app.get(
      "/api/jobs/:id",
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid job ID format",
          });
        }
        const job = await careerCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).json({
            success: false,
            message: "Job not found",
          });
        }
        res.status(200).json({
          success: true,
          data: job,
        });
      }),
    );

    // POST /api/jobs - Create a job post (ADMIN ONLY)
    app.post(
      "/api/jobs",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const {
          title,
          company,
          location,
          employmentType,
          description,
          requirements,
          applicationUrl,
          deadline,
        } = req.body;

        if (!title || !company || !location || !description) {
          return res.status(400).json({
            success: false,
            message: "Title, company, location, and description are required",
          });
        }

        const newJob = {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          employmentType: employmentType?.trim() || "Full-time",
          description: description.trim(),
          requirements: requirements?.trim() || "",
          applicationUrl: applicationUrl?.trim() || "",
          deadline: deadline ? new Date(deadline) : null,
          createdBy: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await careerCollection.insertOne(newJob);
        const savedJob = await careerCollection.findOne({
          _id: result.insertedId,
        });

        res.status(201).json({
          success: true,
          message: "Job created successfully",
          data: savedJob,
        });
      }),
    );

    // PUT /api/jobs/:id - Update a job post (ADMIN ONLY)
    app.put(
      "/api/jobs/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid job ID format",
          });
        }

        const {
          title,
          company,
          location,
          employmentType,
          description,
          requirements,
          applicationUrl,
          deadline,
        } = req.body;

        const updateFields = { updatedAt: new Date() };
        if (title) updateFields.title = title.trim();
        if (company) updateFields.company = company.trim();
        if (location) updateFields.location = location.trim();
        if (employmentType) updateFields.employmentType = employmentType.trim();
        if (description) updateFields.description = description.trim();
        if (requirements !== undefined)
          updateFields.requirements = requirements?.trim() || "";
        if (applicationUrl !== undefined)
          updateFields.applicationUrl = applicationUrl?.trim() || "";
        if (deadline !== undefined)
          updateFields.deadline = deadline ? new Date(deadline) : null;

        const updatedJob = await careerCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateFields },
          { returnDocument: "after" },
        );

        if (!updatedJob) {
          return res.status(404).json({
            success: false,
            message: "Job not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Job updated successfully",
          data: updatedJob,
        });
      }),
    );

    // DELETE /api/jobs/:id - Delete a job post (ADMIN ONLY)
    app.delete(
      "/api/jobs/:id",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid job ID format",
          });
        }

        const deletedJob = await careerCollection.findOneAndDelete({
          _id: new ObjectId(id),
        });

        if (!deletedJob) {
          return res.status(404).json({
            success: false,
            message: "Job not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Job deleted successfully",
        });
      }),
    );

    // GET /api/jobs/:id/applications - View applications for a job (ADMIN ONLY)
    app.get(
      "/api/jobs/:id/applications",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid job ID format",
          });
        }

        const applications = await careerApplicationsCollection
          .aggregate([
            { $match: { jobId: new ObjectId(id) } },
            {
              $lookup: {
                from: "usersCollection",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                documents: 1,
                notes: 1,
                createdAt: 1,
                "user._id": 1,
                "user.name": 1,
                "user.email": 1,
              },
            },
          ])
          .toArray();

        res.status(200).json({
          success: true,
          data: applications,
        });
      }),
    );

    // POST /api/jobs/:id/apply - User applies to a job (Protected)
    app.post(
      "/api/jobs/:id/apply",
      authenticateToken,
      asyncHandler(async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid job ID format",
          });
        }

        const job = await careerCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).json({
            success: false,
            message: "Job not found",
          });
        }

        // Check deadline
        if (job.deadline && new Date(job.deadline) < new Date()) {
          return res.status(400).json({
            success: false,
            message: "Applications for this job are closed.",
          });
        }

        const { documents, notes } = req.body;

        const application = {
          jobId: job._id,
          userId: req.user._id,
          documents: documents?.trim() || "",
          notes: notes?.trim() || "",
          createdAt: new Date(),
        };

        await careerApplicationsCollection.insertOne(application);

        res.status(201).json({
          success: true,
          message: "Application submitted successfully.",
        });
      }),
    );

    // GET /api/documents/proxy - Must be before /api/documents to avoid match conflicts
    app.get(
      "/api/documents/proxy",
      asyncHandler(async (req, res) => {
        const { url, download } = req.query;
        if (!url || typeof url !== "string") {
          return res.status(400).json({
            success: false,
            message: "URL is required",
          });
        }
        if (!url.startsWith("https://res.cloudinary.com/")) {
          return res.status(400).json({
            success: false,
            message: "Invalid document URL",
          });
        }

        try {
          const axiosRes = await axios.get(url, {
            responseType: "arraybuffer",
            maxRedirects: 5,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept: "application/pdf,*/*",
            },
          });

          const buffer = Buffer.from(axiosRes.data);

          res.set("Content-Type", "application/pdf");
          res.set(
            "Content-Disposition",
            download === "1" ? "attachment; filename=document.pdf" : "inline",
          );
          res.send(buffer);
        } catch (error) {
          return res.status(502).json({
            success: false,
            message: `Failed to fetch document: ${error.message}`,
          });
        }
      }),
    );

    // GET /api/documents - Get current user's documents (Protected)
    app.get(
      "/api/documents",
      authenticateToken,
      asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const docs = await documentsCollection.findOne({ userId });

        res.status(200).json({
          success: true,
          data: docs || null,
        });
      }),
    );

    // POST /api/documents - Upload user documents (Protected)
    app.post(
      "/api/documents",
      authenticateToken,
      asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const {
          passportCopy,
          cv,
          sop,
          englishProficiency,
          sscCertificate,
          hscCertificate,
          bachelorsCertificate,
          mastersCertificate,
          sscTranscript,
          hscTranscript,
          bachelorsTranscript,
          mastersTranscript,
          workExperience,
          lors,
        } = req.body;

        // Check if documents already exist for this user
        const existing = await documentsCollection.findOne({ userId });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Documents already uploaded. Use PUT to update.",
          });
        }

        const newDoc = {
          userId,
          passportCopy: passportCopy || "",
          cv: cv || "",
          sop: sop || "",
          englishProficiency: englishProficiency || "",
          sscCertificate: sscCertificate || "",
          hscCertificate: hscCertificate || "",
          bachelorsCertificate: bachelorsCertificate || "",
          mastersCertificate: mastersCertificate || "",
          sscTranscript: sscTranscript || "",
          hscTranscript: hscTranscript || "",
          bachelorsTranscript: bachelorsTranscript || "",
          mastersTranscript: mastersTranscript || "",
          workExperience: workExperience || "",
          lors: lors || "",
          validationStatus: "pending",
          feedback: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await documentsCollection.insertOne(newDoc);

        res.status(201).json({
          success: true,
          message: "Documents uploaded successfully",
          data: newDoc,
        });
      }),
    );

    // PUT /api/documents - Update user documents (Protected)
    app.put(
      "/api/documents",
      authenticateToken,
      asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const {
          passportCopy,
          cv,
          sop,
          englishProficiency,
          sscCertificate,
          hscCertificate,
          bachelorsCertificate,
          mastersCertificate,
          sscTranscript,
          hscTranscript,
          bachelorsTranscript,
          mastersTranscript,
          workExperience,
          lors,
        } = req.body;

        const updateFields = { updatedAt: new Date() };
        if (passportCopy !== undefined)
          updateFields.passportCopy = passportCopy;
        if (cv !== undefined) updateFields.cv = cv;
        if (sop !== undefined) updateFields.sop = sop;
        if (englishProficiency !== undefined)
          updateFields.englishProficiency = englishProficiency;
        if (sscCertificate !== undefined)
          updateFields.sscCertificate = sscCertificate;
        if (hscCertificate !== undefined)
          updateFields.hscCertificate = hscCertificate;
        if (bachelorsCertificate !== undefined)
          updateFields.bachelorsCertificate = bachelorsCertificate;
        if (mastersCertificate !== undefined)
          updateFields.mastersCertificate = mastersCertificate;
        if (sscTranscript !== undefined)
          updateFields.sscTranscript = sscTranscript;
        if (hscTranscript !== undefined)
          updateFields.hscTranscript = hscTranscript;
        if (bachelorsTranscript !== undefined)
          updateFields.bachelorsTranscript = bachelorsTranscript;
        if (mastersTranscript !== undefined)
          updateFields.mastersTranscript = mastersTranscript;
        if (workExperience !== undefined)
          updateFields.workExperience = workExperience;
        if (lors !== undefined) updateFields.lors = lors;

        const updated = await documentsCollection.findOneAndUpdate(
          { userId },
          { $set: updateFields },
          { returnDocument: "after", upsert: true },
        );

        res.status(200).json({
          success: true,
          message: "Documents updated successfully",
          data: updated,
        });
      }),
    );

    // DELETE /api/documents - Delete user documents (Protected)
    app.delete(
      "/api/documents",
      authenticateToken,
      asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const deleted = await documentsCollection.findOneAndDelete({ userId });

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: "No documents found to delete",
          });
        }

        res.status(200).json({
          success: true,
          message: "Documents deleted successfully",
        });
      }),
    );

    // GET /api/admin/documents - Get all user documents (ADMIN ONLY)
    app.get(
      "/api/admin/documents",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const allDocs = await documentsCollection
          .aggregate([
            {
              $lookup: {
                from: "usersCollection",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                userId: 1,
                passportCopy: 1,
                cv: 1,
                sop: 1,
                englishProficiency: 1,
                sscCertificate: 1,
                hscCertificate: 1,
                bachelorsCertificate: 1,
                mastersCertificate: 1,
                sscTranscript: 1,
                hscTranscript: 1,
                bachelorsTranscript: 1,
                mastersTranscript: 1,
                workExperience: 1,
                lors: 1,
                validationStatus: 1,
                feedback: 1,
                createdAt: 1,
                updatedAt: 1,
                "user._id": 1,
                "user.name": 1,
                "user.email": 1,
              },
            },
          ])
          .toArray();

        res.status(200).json({
          success: true,
          data: allDocs,
        });
      }),
    );

    // PUT /api/admin/documents/feedback - Admin sets validation status and feedback
    app.put(
      "/api/admin/documents/feedback",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { userId, status, feedback } = req.body;

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: "User ID is required",
          });
        }

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status must be pending, approved, or rejected",
          });
        }

        const updated = await documentsCollection.findOneAndUpdate(
          { userId: new ObjectId(userId) },
          {
            $set: {
              validationStatus: status,
              feedback: feedback?.trim() || "",
              feedbackUpdatedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { returnDocument: "after" },
        );

        if (!updated) {
          return res.status(404).json({
            success: false,
            message: "No documents found for this user",
          });
        }

        res.status(200).json({
          success: true,
          message: "Feedback submitted successfully",
          data: updated,
        });
      }),
    );

    // DELETE /api/admin/documents/:userId - Admin deletes user's documents
    app.delete(
      "/api/admin/documents/:userId",
      authenticateToken,
      requireAdmin,
      asyncHandler(async (req, res) => {
        const { userId } = req.params;

        if (!userId || !ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const deleted = await documentsCollection.findOneAndDelete({
          userId: new ObjectId(userId),
        });

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: "No documents found for this user",
          });
        }

        res.status(200).json({
          success: true,
          message: "User documents deleted successfully",
        });
      }),
    );

    // ==================== Payment Gateway ROUTES ====================
    // SSLCommerz expects application/x-www-form-urlencoded, NOT JSON
    const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "testbox";
    const SSLCOMMERZ_STORE_PASSWD =
      process.env.SSLCOMMERZ_STORE_PASSWD || "qwerty";
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${port}`;

    // SSLCommerz environment:
    // - MODE=sandbox: always use sandbox gateway (safe for testing, even in production)
    // - MODE=live: use live gateway (requires approved live store + live credentials)
    // - default: sandbox in dev, live in production
    const isProduction = process.env.NODE_ENV === "production";
    const SSLCOMMERZ_MODE =
      process.env.SSLCOMMERZ_MODE || (isProduction ? "live" : "sandbox");

    const SSLCOMMERZ_BASE_URL =
      SSLCOMMERZ_MODE === "live"
        ? "https://securepay.sslcommerz.com"
        : "https://sandbox.sslcommerz.com";
    const SSLCOMMERZ_API_URL = `${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`;
    const SSLCOMMERZ_VALIDATOR_URL = `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php`;

    // Validate SSLCommerz IPN callback using Order Validation API
    const validateSSLCommerzIPN = async (tranId, valId) => {
      if (!tranId || !valId) return false;
      try {
        const params = new URLSearchParams({
          store_id: SSLCOMMERZ_STORE_ID,
          store_passwd: SSLCOMMERZ_STORE_PASSWD,
          val_id: valId,
          format: "json",
        });
        const response = await axios.get(
          `${SSLCOMMERZ_VALIDATOR_URL}?${params.toString()}`,
        );
        const data = response.data;
        // Verify transaction ID matches and status is VALID
        return (
          data?.status === "VALID" &&
          data?.tran_id === tranId &&
          data?.risk_level === "0"
        );
      } catch (error) {
        console.error("[Payment] IPN validation error:", error.message);
        return false;
      }
    };

    // Create payment - accepts optional auth token (recommended for logged-in users)
    // SECURITY: Authentication is optional to allow guest payments, but authenticated
    // payments are preferred as they link to user accounts and prevent spoofing
    app.post(
      "/api/create-payment",
      asyncHandler(async (req, res) => {
        const {
          amount,
          currency = "BDT",
          cus_name,
          cus_email,
          cus_phone,
          userId,
          purpose,
        } = req.body;
        if (!amount || amount < 10) {
          return res.status(400).json({
            success: false,
            message: "Amount is required (min 10 BDT)",
          });
        }
        if (amount > 100000) {
          return res.status(400).json({
            success: false,
            message: "Amount exceeds maximum limit (100,000 BDT)",
          });
        }

        // Optional: get logged-in user from token to attach to payment
        let paidByUserId = userId || null;
        const authHeader = req.headers["authorization"];
        if (authHeader && authHeader.startsWith("Bearer ") && usersCollection) {
          try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await usersCollection.findOne({
              _id: new ObjectId(decoded.userId),
            });
            if (user) {
              paidByUserId = user._id.toString();
            }
          } catch (_) {
            // ignore invalid token; use body data only
          }
        }

        const tranId =
          "TXN" +
          Date.now() +
          Math.random().toString(36).slice(2, 8).toUpperCase();
        const name = cus_name || "Customer";
        const email = cus_email || "customer@example.com";
        const phone = cus_phone || "01711111111";
        const purposeLabel = purpose || "Study Abroad Application Fee";

        const paymentDoc = {
          paymentId: tranId,
          tran_id: tranId,
          amount: Number(amount),
          currency: String(currency).toUpperCase().slice(0, 3),
          status: "pending",
          cus_name: name,
          cus_email: email,
          cus_phone: phone,
          userId: paidByUserId || null,
          purpose: purposeLabel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (paymentCollection) {
          await paymentCollection.insertOne(paymentDoc);
        }

        const successUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/success`;
        const failUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/fail`;
        const cancelUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/cancel`;

        const params = new URLSearchParams({
          store_id: SSLCOMMERZ_STORE_ID,
          store_passwd: SSLCOMMERZ_STORE_PASSWD,
          total_amount: String(Number(amount).toFixed(2)),
          currency: String(currency).toUpperCase().slice(0, 3),
          tran_id: tranId,
          product_category: "education",
          product_profile: "general",
          product_name: purposeLabel,
          success_url: successUrl,
          fail_url: failUrl,
          cancel_url: cancelUrl,
          cus_name: name,
          cus_email: email,
          cus_add1: "Dhaka",
          cus_add2: "Dhaka",
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: "1000",
          cus_country: "Bangladesh",
          cus_phone: phone,
          cus_fax: phone,
          ship_name: name,
          ship_add1: "Dhaka",
          ship_add2: "Dhaka",
          ship_city: "Dhaka",
          ship_state: "Dhaka",
          ship_postcode: "1000",
          ship_country: "Bangladesh",
          shipping_method: "NO",
        });

        const response = await axios.post(
          SSLCOMMERZ_API_URL,
          params.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        const data = response.data;
        if (data?.status === "SUCCESS" && data?.GatewayPageURL) {
          return res.json({
            success: true,
            GatewayPageURL: data.GatewayPageURL,
            sessionkey: data.sessionkey,
          });
        }

        return res.status(400).json({
          success: false,
          message: data?.failedreason || "Payment init failed",
        });
      }),
    );

    // SSLCommerz POSTs to these URLs after payment - validate IPN, update DB, then redirect
    app.post(
      "/api/payment/success",
      asyncHandler(async (req, res) => {
        const tranId = req.body?.tran_id;
        const valId = req.body?.val_id;

        // Validate IPN with SSLCommerz (security: prevent spoofing)
        const isValid = await validateSSLCommerzIPN(tranId, valId);

        if (paymentCollection && tranId) {
          if (isValid) {
            // Only update if IPN is valid
            await paymentCollection.updateOne(
              { tran_id: tranId },
              {
                $set: {
                  status: "success",
                  updatedAt: new Date(),
                  val_id: valId,
                },
              },
            );
          } else {
            // Log suspicious activity but don't update status
            console.warn(
              `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
            );
          }
        }
        // Always redirect (don't reveal validation failure to attacker)
        res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/success`);
      }),
    );
    app.post(
      "/api/payment/fail",
      asyncHandler(async (req, res) => {
        const tranId = req.body?.tran_id;
        const valId = req.body?.val_id;

        // Validate IPN
        const isValid = await validateSSLCommerzIPN(tranId, valId);

        if (paymentCollection && tranId) {
          if (isValid) {
            await paymentCollection.updateOne(
              { tran_id: tranId },
              {
                $set: { status: "fail", updatedAt: new Date(), val_id: valId },
              },
            );
          } else {
            console.warn(
              `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
            );
          }
        }
        res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/fail`);
      }),
    );
    app.post(
      "/api/payment/cancel",
      asyncHandler(async (req, res) => {
        const tranId = req.body?.tran_id;
        const valId = req.body?.val_id;

        // Validate IPN
        const isValid = await validateSSLCommerzIPN(tranId, valId);

        if (paymentCollection && tranId) {
          if (isValid) {
            await paymentCollection.updateOne(
              { tran_id: tranId },
              {
                $set: {
                  status: "cancel",
                  updatedAt: new Date(),
                  val_id: valId,
                },
              },
            );
          } else {
            console.warn(
              `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
            );
          }
        }
        res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/cancel`);
      }),
    );

    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 }); 
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Bhaai Running");
});
app.listen(port, () => {
  console.log(`Port Is Running On ${port}`);
});
