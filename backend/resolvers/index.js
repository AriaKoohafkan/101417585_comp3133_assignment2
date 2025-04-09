const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const SECRET_KEY = process.env.JWT_SECRET || "qwerty14";

const resolvers = {
  Query: {
    // Login Query - Returning JWT Token
    login: async (_, { usernameOrEmail, password }) => {
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "2h" });
    },

    // Get All Employees - Requires Authentication
    getAllEmployees: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized access");
      return await Employee.find();
    },

    // Search Employee by ID - Requires Authentication
    searchEmployeeByEid: async (_, { eid }, { user }) => {
      if (!user) throw new Error("Unauthorized access");
      return await Employee.findById(eid);
    },

    // Search Employee by Designation / Department
    searchEmployeeByDesignationOrDepartment: async (_, { searchTerm }, { user }) => {
      if (!user) throw new Error("Unauthorized access");
      return await Employee.find({
        $or: [{ designation: searchTerm }, { department: searchTerm }],
      });
    },
  },

  Mutation: {
    // Signup - Creates a New User
    signup: async (_, { first_name, last_name, username, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ first_name, last_name, username, email, password: hashedPassword });

      await user.save();
      return user;
    },

    // Add Employee - Requires Authentication
    addEmployee: async (_, { input }, { user }) => {
      if (!user) throw new Error("Unauthorized access");

      const newEmployee = new Employee(input);
      await newEmployee.save();

      return newEmployee;
    },

    // Update Employee - Requires Authentication
    updateEmployee: async (_, { eid, input }, { user }) => {
      if (!user) throw new Error("Unauthorized access");
      return await Employee.findByIdAndUpdate(eid, input, { new: true });
    },

    // Delete Employee - Requires Authentication
    deleteEmployee: async (_, { eid }, { user }) => {
      if (!user) throw new Error("Unauthorized access");

      await Employee.findByIdAndDelete(eid);
      return true;
    },
  },
};

module.exports = resolvers;
