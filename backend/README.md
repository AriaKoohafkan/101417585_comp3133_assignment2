# Employee Management System

## 📌 Overview Description
This is a **backend-only GraphQL-based Employee Management System** built using **Node.js, Express.js, Apollo Server, and MongoDB**. It allows users to **register, authenticate, and manage employee records** with a secure **JWT-based authentication system**.

This project is developed as part of **COMP3133 - Fullstack Web Development II** at **George Brown College**.

---

## 🚀 Tech Stack
- **Backend:** Node.js, Express.js
- **GraphQL:** Apollo Server
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Token)
- **Tools:** Postman, MongoDB Compass, GraphQL Playground

---

## 💂️ Features
- **User Authentication (JWT-based)**
- **GraphQL API for Employee Management**
- **Secure Password Hashing**
- **CRUD Operations for Employees**
- **Error Handling & Validation**

---

## 📚 Folder Structure
```
.
├── models/          # Mongoose Models (User, Employee)
├── resolvers/       # GraphQL Resolvers
├── schemas/         # GraphQL Type Definitions
├── validations/     # Input Validations
├── config/          # Database & JWT Configurations
├── server.js        # Main Server File
├── .env             # Environment Variables
├── package.json     # Project Dependencies
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/AriaKoohafkan/101417585_COMP3133_StudentID_Assignment1-.git
cd employee-management-system
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a **.env** file in the root directory and add:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### 4️⃣ Start the Server
```bash
npm start
```
Server will run on: `http://localhost:5000/graphql`

---

## 🔑 Authentication
### **Register User**
```graphql
mutation {
  register(username: "admin", email: "admin@example.com", password: "password") {
    id
    username
    email
  }
}
```

### **Login User (Get Token)**
```graphql
mutation {
  login(email: "admin@example.com", password: "password")
}
```

### **Use the Token in Postman**
- In Postman, set the **Authorization Header**:
  ```
  Key: Authorization
  Value: Bearer <your-token>
  ```

---

## 🏢 Employee Management

### **Add Employee**
```graphql
mutation {
  addEmployee(name: "John Doe", position: "Developer", salary: 70000) {
    id
    name
    position
    salary
  }
}
```

### **Get Employees**
```graphql
query {
  employees {
    id
    name
    position
    salary
  }
}
```

---

## 🚀 Troubleshooting

### **JWT Token Expired?**
- Generate a new token by logging in again.
- If the expiration time is too short, update the token lifespan in `server.js`.

### **MongoDB Connection Issues?**
- Ensure MongoDB is running locally or update **MONGO_URI** in `.env` to an **Atlas connection string**.

---

## 📸 Screenshots

**Screenshots for my tests and MongoDB collections are provided in the docx sub-folder:**

docx\COMP 3133-assignmen.docx
---

## 🌐 License & Author

**Author:** Aria Koohafkan  
**GitHub:** [AriaKoohafkan](https://github.com/AriaKoohafkan)  

This project is developed for **COMP3133 - George Brown College**.

