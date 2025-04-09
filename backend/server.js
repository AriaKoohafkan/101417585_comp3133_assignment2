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

// import the correct User model here for login
const User = require("./models/User");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "qwerty14";
const PORT = process.env.PORT || 5000;

// Multer storage setup
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

  // CORS setup for Angular frontend (http://localhost:4200)
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

  // REST route to handle photo upload
  app.post("/api/upload-photo", upload.single("profilePicture"), (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded under 'profilePicture'" });
    }
    // Return the path to the uploaded photo
    return res.json({ path: req.file.path });
  });

  // REST route to handle employee creation with file upload
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

  // LOGIN ROUTE
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = { id: user._id, email: user.email };

      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

      res.status(200).json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    console.log(`📁 Photo upload endpoint at http://localhost:${PORT}/api/upload-photo`);
    console.log(`🔐 Login endpoint at http://localhost:${PORT}/login`);
  });
};

startServer();
