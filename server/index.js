const express = require("express");
const cors = require("cors");
require("dotenv").config();
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

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ensure all responses are JSON (unless already sent)
const ensureJsonResponse = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json');
    return originalJson.call(this, data);
  };
  next();
};
app.use(ensureJsonResponse);

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
    console.log("Connected to MongoDB!");

    // Collections
    usersCollection = client.db("FineAnswer").collection("usersCollection");













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

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

// Middleware to check if database is connected
const checkDatabaseConnection = (req, res, next) => {
  if (!usersCollection) {
    return res.status(503).json({
      success: false,
      message: "Database connection not established. Please try again."
    });
  }
  next();
};

// POST /api/auth/login - Login with email and password
app.post("/api/auth/login", checkDatabaseConnection, async (req, res) => {
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
    let user;
    try {
      user = await usersCollection.findOne({ email });
    } catch (dbError) {
      console.error("Database error in login:", dbError);
      return res.status(503).json({
        success: false,
        message: "Database error. Please try again."
      });
    }

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
    
    // Ensure we always return JSON, even if there's an error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message || "Unknown error occurred"
      });
    }
  }
});

// POST /api/auth/google - Login/Register with Google OAuth
app.post("/api/auth/google", checkDatabaseConnection, async (req, res) => {
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
    let user = null;
    try {
      user = await usersCollection.findOne({ googleId });
    } catch (dbError) {
      console.error("Database error in Google login:", dbError);
      return res.status(503).json({
        success: false,
        message: "Database error. Please try again."
      });
    }
    
    if (!user) {
      // Check by email
      try {
        user = await usersCollection.findOne({ email });
      } catch (dbError) {
        console.error("Database error in Google login:", dbError);
        return res.status(503).json({
          success: false,
          message: "Database error. Please try again."
        });
      }
      
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
    
    // Ensure we always return JSON, even if there's an error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message || "Unknown error occurred"
      });
    }
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
app.post("/api/users", checkDatabaseConnection, async (req, res) => {
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
      try {
        const existingGoogleUser = await usersCollection.findOne({ googleId });
        if (existingGoogleUser) {
          return res.status(400).json({ 
            success: false, 
            message: "User with this Google account already exists" 
          });
        }
      } catch (dbError) {
        console.error("Database error in registration:", dbError);
        return res.status(503).json({
          success: false,
          message: "Database error. Please try again."
        });
      }
    }
    
    // Check by email (for both email and Google users)
    let existingUser;
    try {
      existingUser = await usersCollection.findOne({ email });
    } catch (dbError) {
      console.error("Database error in registration:", dbError);
      return res.status(503).json({
        success: false,
        message: "Database error. Please try again."
      });
    }
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
    
    // Ensure we always return JSON, even if there's an error
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error", 
        error: error.message || "Unknown error occurred"
      });
    }
  }
});



// GET /api/users - Get all users
app.get("/api/users", checkDatabaseConnection, async (req, res) => {
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
app.get("/api/users/google/:googleId", checkDatabaseConnection, async (req, res) => {
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
app.get("/api/users/email/:email", checkDatabaseConnection, async (req, res) => {
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
app.get("/api/users/:id", checkDatabaseConnection, async (req, res) => {
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

// 404 Handler - Return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global Error Handler - Return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  
  // Ensure response hasn't been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Always return JSON
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Port Is Running On bhaai ree ${port}`);
});