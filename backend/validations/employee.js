const { body } = require('express-validator');
const validateEmployee = [
  body('salary').isFloat({ min: 1000 }).withMessage('Salary must be ≥ 1000'),
  // Add other validations here
];
module.exports = validateEmployee;