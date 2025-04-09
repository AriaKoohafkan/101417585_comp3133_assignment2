const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    username: String!
    email: String!
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
  }

  type Query {
    login(usernameOrEmail: String!, password: String!): String!
    getAllEmployees: [Employee!]!
    searchEmployeeByEid(eid: ID!): Employee
    searchEmployeeByDesignationOrDepartment(searchTerm: String!): [Employee!]!
  }

  type Mutation {
    signup(
      first_name: String!
      last_name: String!
      username: String!
      email: String!
      password: String!
    ): User!

    addEmployee(input: EmployeeInput!): Employee!
    updateEmployee(eid: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(eid: ID!): Boolean!
  }

  input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
  }
`;

module.exports = typeDefs;
