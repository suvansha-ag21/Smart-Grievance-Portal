const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");
const generateToken = require("../utils/generateToken");
const { getIsConnected } = require("../config/db");

// Pre-seeded demo accounts (passwords hashed with bcrypt)
const DEFAULT_USERS = [
  {
    _id: "660000000000000000000001",
    name: "Ramesh Sharma",
    email: "citizen@example.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    phone: "+91 98765 43210",
    address: "Sector 14, Main Road, New Delhi",
    role: "client",
    department: null,
  },
  {
    _id: "660000000000000000000002",
    name: "Vikram Malhotra",
    email: "officer@example.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    phone: "+91 98111 22334",
    address: "Municipal Corporation Office, Ward 4",
    role: "officer",
    department: "Roads & Infrastructure",
  },
];

// In-memory runtime store for when MongoDB daemon is not running
let inMemoryUsers = [...DEFAULT_USERS];

// Helper to normalize roles
const normalizeRole = (r) => {
  if (!r) return "";
  const lower = String(r).toLowerCase().trim();
  if (lower === "citizen" || lower === "client") return "client";
  return lower;
};

// Seed demo users into MongoDB if connected
const seedDatabaseIfConnected = async () => {
  if (!getIsConnected()) return;
  try {
    for (const u of DEFAULT_USERS) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name,
          email: u.email,
          password: u.passwordHash,
          phone: u.phone,
          address: u.address,
          role: u.role,
        });
      }
    }
  } catch (err) {
    // ignore duplicate or background seed errors
  }
};
setTimeout(seedDatabaseIfConnected, 3000);

const getDepartmentId = async (departmentValue) => {
  if (!departmentValue) return null;
  if (!getIsConnected()) return departmentValue;

  if (mongoose.isValidObjectId(departmentValue)) return departmentValue;
  if (typeof departmentValue === "object" && departmentValue._id) return departmentValue._id;
  if (typeof departmentValue !== "string") return null;

  const trimmed = departmentValue.trim();
  if (!trimmed) return null;

  try {
    const escapedName = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let department = await Department.findOne({
      departmentName: { $regex: `^${escapedName}$`, $options: "i" },
    });

    if (!department) {
      department = await Department.create({ departmentName: trimmed });
    }
    return department._id;
  } catch {
    return null;
  }
};

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, department } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const safeRole = normalizeRole(role) || "client";

    // 1. If MongoDB is connected, use Mongoose
    if (getIsConnected()) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const departmentId = await getDepartmentId(department);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name ? name.trim() : cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || "",
        address: address || "",
        role: safeRole,
        department: departmentId,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role === "citizen" ? "client" : user.role,
        department: department || null,
        token: generateToken(user._id),
      });
    }

    // 2. Resilient In-Memory Fallback
    const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: "user_" + Date.now(),
      name: name ? name.trim() : cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash: hashedPassword,
      phone: phone || "",
      address: address || "",
      role: safeRole,
      department: department || null,
    };
    inMemoryUsers.push(newUser);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || "",
      address: newUser.address || "",
      role: newUser.role,
      department: newUser.department,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If MongoDB is connected
    if (getIsConnected()) {
      const user = await User.findOne({
        email: { $regex: `^${cleanEmail}$`, $options: "i" },
      }).populate("department", "departmentName");

      if (user && (await bcrypt.compare(password, user.password))) {
        // Check requested role matching if specified
        if (role) {
          const reqRole = normalizeRole(role);
          const userRole = normalizeRole(user.role);
          if (reqRole && userRole && reqRole !== userRole) {
            return res.status(401).json({
              message: `This account is registered as '${user.role}'. Please use the matching portal tab.`,
            });
          }
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          role: user.role === "citizen" ? "client" : user.role,
          department: user.department ? user.department.departmentName : null,
          token: generateToken(user._id),
        });
      }
    }

    // 2. Check in-memory store (works if MongoDB is offline or for demo users)
    const memUser = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (memUser) {
      const match = await bcrypt.compare(password, memUser.passwordHash);
      if (match) {
        if (role) {
          const reqRole = normalizeRole(role);
          const userRole = normalizeRole(memUser.role);
          if (reqRole && userRole && reqRole !== userRole) {
            return res.status(401).json({
              message: `This account is registered as '${memUser.role}'. Please use the matching portal tab.`,
            });
          }
        }

        return res.json({
          _id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          phone: memUser.phone || "",
          address: memUser.address || "",
          role: memUser.role,
          department: memUser.department || null,
          token: generateToken(memUser._id),
        });
      }
    }

    return res.status(401).json({
      message: "Invalid email or password. Check credentials or try one of the demo logins.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getUserProfile = async (req, res) => {
  try {
    if (getIsConnected()) {
      const user = await User.findById(req.user._id).select("-password").populate("department", "departmentName");
      if (user) return res.json(user);
    }
    const memUser = inMemoryUsers.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      const { passwordHash, ...rest } = memUser;
      return res.json(rest);
    }
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (getIsConnected()) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        const updated = await user.save();

        return res.json({
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          role: updated.role === "citizen" ? "client" : updated.role,
          token: generateToken(updated._id),
        });
      }
    }

    const memUser = inMemoryUsers.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      if (name) memUser.name = name.trim();
      if (phone !== undefined) memUser.phone = phone.trim();
      if (address !== undefined) memUser.address = address.trim();

      return res.json({
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        address: memUser.address,
        role: memUser.role,
        token: generateToken(memUser._id),
      });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    if (getIsConnected()) {
      const user = await User.findById(req.user._id);
      if (user) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password does not match records" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.json({ message: "Password updated successfully" });
      }
    }

    const memUser = inMemoryUsers.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      const isMatch = await bcrypt.compare(currentPassword, memUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password does not match records" });
      }
      memUser.passwordHash = await bcrypt.hash(newPassword, 10);
      return res.json({ message: "Password updated successfully" });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  inMemoryUsers,
};
