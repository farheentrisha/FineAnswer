// Suppress dotenvx console tips
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args[0];
  if (message && typeof message === 'string' && message.includes('[dotenv@')) {
    return; // Suppress dotenvx tips
  }
  originalConsoleLog.apply(console, args);
};

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Restore console.log after dotenv loads
setTimeout(() => {
  console.log = originalConsoleLog;
}, 100);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.pvs4l8x.mongodb.net/?appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection references
let usersCollection;
let successStoryCollection;

// JWT Secret (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

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
        message: "Database connection not established. Please try again."
      });
    }

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

// Admin Middleware - Must be used after authenticateToken
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
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
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch((error) => {
  console.error("Failed to start MongoDB connection:", error);
});

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Running Bhaai Running",
    status: "ok",
    database: usersCollection ? "connected" : "disconnected"
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    database: usersCollection ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/login - Login with email and password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user is using email authentication
    if (user.authProvider !== "email") {
      return res.status(400).json({
        success: false,
        message: "This email is registered with Google. Please use Google login."
      });
    }

    // Check if password exists
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check and update admin status
    const adminStatus = isAdminUser(user.email);
    if (user.isAdmin !== adminStatus) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { isAdmin: adminStatus, updatedAt: new Date() } }
      );
      user.isAdmin = adminStatus;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// POST /api/auth/google - Login/Register with Google OAuth
app.post("/api/auth/google", async (req, res) => {
  try {
    const { email, googleId, name, picture } = req.body;

    // Validation
    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: "Email and googleId are required"
      });
    }

    // Check if user exists by googleId or email
    let user = await usersCollection.findOne({ googleId });
    
    if (!user) {
      // Check by email
      user = await usersCollection.findOne({ email });
      
      if (user) {
        // Check and update admin status
        const adminStatus = isAdminUser(email);
        
        // User exists with email but not Google ID - update to add Google ID
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              googleId,
              authProvider: "google",
              picture: picture || user.picture,
              isAdmin: adminStatus,
              updatedAt: new Date()
            }
          }
        );
        user = await usersCollection.findOne({ _id: user._id });
      } else {
        // Check if user is admin
        const adminStatus = isAdminUser(email);

        // Create new Google user
        const newUser = {
          name: name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google",
          picture: picture || null,
          isAdmin: adminStatus,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);
        user = await usersCollection.findOne({ _id: result.insertedId });
      }
    }

    // Check and update admin status
    const adminStatus = isAdminUser(user.email);
    if (user.isAdmin !== adminStatus) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { isAdmin: adminStatus, updatedAt: new Date() } }
      );
      user.isAdmin = adminStatus;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current logged-in user (Protected Route)
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    const { password, ...userWithoutPassword } = req.user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      isAdmin: userWithoutPassword.isAdmin || false
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// POST /api/users - Create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, password, authProvider = "email", googleId, picture } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and email are required fields" 
      });
    }

    // Validate authProvider
    if (authProvider !== "google" && authProvider !== "email") {
      return res.status(400).json({ 
        success: false, 
        message: "authProvider must be either 'email' or 'google'" 
      });
    }

    // Validation for email/password users
    if (authProvider === "email") {
      if (!password) {
        return res.status(400).json({ 
          success: false, 
          message: "Password is required for email authentication" 
        });
      }
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "Password must be at least 6 characters long" 
        });
      }
    }

    // Check if user already exists
    if (authProvider === "google" && googleId) {
      // For Google users, check by googleId first, then email
      const existingGoogleUser = await usersCollection.findOne({ googleId });
      if (existingGoogleUser) {
        return res.status(400).json({ 
          success: false, 
          message: "User with this Google account already exists" 
        });
      }
    }
    
    // Check by email (for both email and Google users)
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Check if user is admin
    const adminStatus = isAdminUser(email);

    // Create user object
    const newUser = {
      name,
      email,
      authProvider,
      isAdmin: adminStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add optional fields based on authProvider
    if (authProvider === "google") {
      // Google OAuth users: phone and password are optional
      if (phone) newUser.phone = phone;
      if (googleId) newUser.googleId = googleId;
      if (picture) newUser.picture = picture;
    } else {
      // Email users: phone is optional, password is required (already validated)
      if (phone) newUser.phone = phone;
      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
    }

    // Insert user into database
    const result = await usersCollection.insertOne(newUser);

    // Return user (without password)
    const user = await usersCollection.findOne({ _id: result.insertedId });
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message
    });
  }
});



// GET /api/users - Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    
    // Remove password from all users
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      count: usersWithoutPassword.length,
      data: usersWithoutPassword
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// GET /api/users/google/:googleId - Get a user by Google ID
app.get("/api/users/google/:googleId", async (req, res) => {
  try {
    const { googleId } = req.params;

    const user = await usersCollection.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error fetching user by Google ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// GET /api/users/email/:email - Get a user by email
app.get("/api/users/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// GET /api/users/:id - Get a single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// ==================== SUCCESS STORIES ROUTES ====================

// GET /api/success-stories - Get all success stories (PUBLIC)
app.get("/api/success-stories", async (req, res) => {
  try {
    const stories = await successStoryCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    res.status(500).json({
      message: "Failed to fetch success stories",
      error: error.message
    });
  }
});

// POST /api/success-stories - Create a new success story (ADMIN ONLY)
app.post("/api/success-stories", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, university, country, program, story, image } = req.body;

    // Validation - ALL fields are required
    if (!name || !university || !country || !program || !story || !image) {
      return res.status(400).json({
        message: "Name, university, country, program, story, and image are required"
      });
    }

    // Validate URL format for image
    try {
      new URL(image);
    } catch (urlError) {
      return res.status(400).json({
        message: "Invalid image URL format"
      });
    }

    // Create new success story
    const newStory = {
      name: name.trim(),
      university: university.trim(),
      country: country.trim(),
      program: program.trim(),
      story: story.trim(),
      image: image.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await successStoryCollection.insertOne(newStory);
    const savedStory = await successStoryCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Success story created successfully",
      story: savedStory
    });
  } catch (error) {
    console.error("Error creating success story:", error);
    res.status(500).json({
      message: "Failed to create success story",
      error: error.message
    });
  }
});

// DELETE /api/success-stories/:id - Delete a success story (ADMIN ONLY)
app.delete("/api/success-stories/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid success story ID format"
      });
    }

    const deletedStory = await successStoryCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });

    if (!deletedStory) {
      return res.status(404).json({
        message: "Success story not found"
      });
    }

    res.status(200).json({
      message: "Success story deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting success story:", error);
    res.status(500).json({
      message: "Failed to delete success story",
      error: error.message
    });
  }
});

app.listen(port, () => {
  // Server started on port ${port}
});