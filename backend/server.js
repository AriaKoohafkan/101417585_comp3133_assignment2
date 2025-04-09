const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const typeDefs = require("./schemas");
const resolvers = require("./resolvers");

const Employee = require("./models/Employee");

// ✅ ✅ ✅ FIXED: Import the correct User model here for login
const User = require("./models/User");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "qwerty14";
const PORT = process.env.PORT || 5000;

// ✅ Multer storage setup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const startServer = async () => {
  const app = express();

  // ✅ CORS setup for Angular frontend (http://localhost:4200)
  app.use(cors({
    origin: "*", // You can set this to 'http://localhost:4200' if you want to restrict to Angular frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  }));

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir)); // Serve uploaded files

  await connectDB();

  // ✅ Apollo GraphQL setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      if (token.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
          return { user: decoded };
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  // ✅ REST route to handle employee creation with file upload
  app.post("/api/employee", upload.single("profilePicture"), async (req, res) => {
    const {
      first_name,
      last_name,
      email,
      gender,
      designation,
      salary,
      date_of_joining,
      department,
    } = req.body;

    const profilePicture = req.file;

    if (!profilePicture) {
      return res.status(400).send({ message: "Profile picture is required" });
    }

    try {
      const newEmployee = new Employee({
        first_name,
        last_name,
        email,
        gender,
        designation,
        salary,
        date_of_joining,
        department,
        employee_photo: profilePicture.path,
      });

      await newEmployee.save();

      res.status(200).send({
        message: "Employee added successfully",
        employee: newEmployee,
      });
    } catch (err) {
      console.error("Error saving employee:", err);
      res.status(500).send({ message: "Error saving employee", error: err.message });
    }
  });

  // ✅ ✅ ✅ FIXED: Corrected login route to use User model
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      // ✅ This now uses the User model to check credentials
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // ✅ Comparing hashed password with the stored one
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // ✅ If credentials are valid, create a JWT payload
      const payload = {
        id: user._id,
        email: user.email,
      };

      // ✅ JWT token is signed and returned to the client
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

      // ✅ Sending the token back as response
      res.status(200).json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ✅ Token save route (optional)
  app.post("/save-token", (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).send({ message: "Token is required" });
    }

    const tokenFilePath = path.join(uploadsDir, "token.txt");

    fs.writeFile(tokenFilePath, token, (err) => {
      if (err) {
        console.error("Error saving token:", err);
        return res.status(500).send({ message: "Error saving token" });
      }

      console.log("✅ Token saved to", tokenFilePath);
      res.status(200).send({ message: "Token saved successfully" });
    });
  });

  // ✅ Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    console.log(`📁 File upload endpoint at http://localhost:${PORT}/api/employee`);
    console.log(`🔐 Login endpoint at http://localhost:${PORT}/login`);
    console.log(`🔐 Token save endpoint at http://localhost:${PORT}/save-token`);
  });
};

startServer();
