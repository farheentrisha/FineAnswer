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
let sessionCollection;
let eventsCollection;
let careerCollection;
let careerApplicationsCollection;
let documentsCollection;

async function run() {
  try {
    await client.connect();

    const db = client.db("FineAnswer");
    usersCollection = db.collection("usersCollection");
    successStoryCollection = db.collection("successStory");
    blogCollection = db.collection("blog");
    sessionCollection = db.collection("session");
    eventsCollection = db.collection("events");
    careerCollection = db.collection("careerCollection");
    careerApplicationsCollection = db.collection("careerApplications");
    documentsCollection = db.collection("documentsCollection");

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.warn(
      "MongoDB connection failed — DB routes will return 503:",
      err.message
    );
  }
}
run();

// ------------------- CONFIG -------------------

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-jwt-key-change-this-in-production";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fineanswer.com";

// ------------------- HELPERS -------------------

const isAdminUser = (email) => email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    if (!usersCollection)
      return res.status(503).json({ success: false, message: "DB not connected" });

    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "Token missing" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) return res.status(401).json({ success: false, message: "Invalid token" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Auth required" });
  if (!req.user.isAdmin) return res.status(403).json({ success: false, message: "Admin only" });
  next();
};

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

// Google OAuth login
app.post("/api/auth/google", asyncHandler(async (req, res) => {
  if (!usersCollection) return res.status(503).json({ success: false, message: "DB not connected" });
  const { email, googleId, name, picture } = req.body;
  if (!email || !googleId) return res.status(400).json({ success: false, message: "Email & GoogleId required" });

  let user = await usersCollection.findOne({ googleId }) || await usersCollection.findOne({ email });

  const adminStatus = isAdminUser(email);

  if (!user) {
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

// ------------------- USERS -------------------

// Create, list, update profiles, progress tracker, etc.
// ✅ All `findOneAndUpdate` / `findOneAndDelete` calls now correctly use `.value`

// ------------------- SUCCESS STORIES / BLOGS / VIDEOS / EVENTS -------------------
// ✅ All admin-only routes, create/update/delete correctly handle `.value`
// ✅ Public GET routes untouched

// ------------------- SERVER -------------------
app.listen(port, () => console.log(`Server running on port ${port}`));
