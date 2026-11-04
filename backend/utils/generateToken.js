const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "smart_grievance_jwt_secret_key_2026";
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
