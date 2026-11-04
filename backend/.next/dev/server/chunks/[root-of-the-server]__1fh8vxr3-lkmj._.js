module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/app/api/announcements/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
const { runHandler } = __turbopack_context__.r("[project]/lib/nextAdapter.js [app-route] (ecmascript)");
const { getAnnouncements, createAnnouncement } = __turbopack_context__.r("[project]/controllers/announcementController.js [app-route] (ecmascript)");
async function GET(request, context) {
    return runHandler(getAnnouncements, request, context);
}
async function POST(request, context) {
    return runHandler(createAnnouncement, request, context, {
        protect: true,
        role: "admin"
    });
}
}),
"[project]/config/db.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
let isMongoConnected = false;
const connectDB = async ()=>{
    if (mongoose.connection.readyState >= 1) {
        isMongoConnected = true;
        return;
    }
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/egrievance";
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2500
        });
        isMongoConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        isMongoConnected = false;
        console.warn(`⚠️ Local MongoDB is not running on 127.0.0.1:27017 (${error.message}).`);
        console.warn(`⚠️ Running with resilient fallback so authentication and APIs function smoothly!`);
    }
};
const getIsConnected = ()=>isMongoConnected && mongoose.connection.readyState === 1;
module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
}),
"[project]/controllers/announcementController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Announcement = __turbopack_context__.r("[project]/models/Announcement.js [app-route] (ecmascript)");
const Notification = __turbopack_context__.r("[project]/models/Notification.js [app-route] (ecmascript)");
const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
// In-memory announcements store fallback
let inMemoryAnnouncements = [];
// Create Announcement & broadcast notification to all citizens
const createAnnouncement = async (req, res)=>{
    try {
        const { title, message, category = "Notice", priority = "Medium", targetWard } = req.body;
        if (!title || !message) {
            return res.status(400).json({
                message: "Title and message are required."
            });
        }
        let announcement;
        try {
            announcement = await Announcement.create({
                title,
                message,
                category,
                priority,
                targetWard: targetWard || "All Wards",
                createdBy: req.user?._id
            });
            // Broadcast in-app notification to all registered citizens
            const citizens = await User.find({
                role: {
                    $in: [
                        "client",
                        "citizen"
                    ]
                }
            }).select("_id");
            if (citizens.length > 0) {
                const notifDocs = citizens.map((c)=>({
                        user: c._id,
                        message: `📢 Official Civic Notice: ${title} - ${message.slice(0, 90)}...`,
                        type: "Announcement",
                        isRead: false
                    }));
                await Notification.insertMany(notifDocs);
            }
        } catch (dbErr) {
            // Fallback in-memory announcement
            announcement = {
                _id: `ann-${Date.now()}`,
                title,
                message,
                category,
                priority,
                targetWard: targetWard || "All Wards",
                createdBy: {
                    _id: req.user?._id,
                    name: req.user?.name || "Civic Officer"
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            inMemoryAnnouncements.unshift(announcement);
        }
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Get All Announcements
const getAnnouncements = async (req, res)=>{
    try {
        let announcements;
        try {
            announcements = await Announcement.find().populate("createdBy", "name").sort({
                createdAt: -1
            });
        } catch  {
            announcements = inMemoryAnnouncements;
        }
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Update Announcement
const updateAnnouncement = async (req, res)=>{
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }
        announcement.title = req.body.title || announcement.title;
        announcement.message = req.body.message || announcement.message;
        announcement.category = req.body.category || announcement.category;
        announcement.priority = req.body.priority || announcement.priority;
        await announcement.save();
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Delete Announcement
const deleteAnnouncement = async (req, res)=>{
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }
        await announcement.deleteOne();
        res.status(200).json({
            message: "Announcement deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
};
}),
"[project]/controllers/authController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const bcrypt = __turbopack_context__.r("[project]/node_modules/bcryptjs/umd/index.js [app-route] (ecmascript)");
const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
const Department = __turbopack_context__.r("[project]/models/Department.js [app-route] (ecmascript)");
const generateToken = __turbopack_context__.r("[project]/utils/generateToken.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
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
        department: null
    },
    {
        _id: "660000000000000000000002",
        name: "Vikram Malhotra",
        email: "officer@example.com",
        passwordHash: bcrypt.hashSync("password123", 10),
        phone: "+91 98111 22334",
        address: "Municipal Corporation Office, Ward 4",
        role: "officer",
        department: "Roads & Infrastructure"
    }
];
// In-memory runtime store for when MongoDB daemon is not running
let inMemoryUsers = [
    ...DEFAULT_USERS
];
// Helper to normalize roles
const normalizeRole = (r)=>{
    if (!r) return "";
    const lower = String(r).toLowerCase().trim();
    if (lower === "citizen" || lower === "client") return "client";
    return lower;
};
// Seed demo users into MongoDB if connected
const seedDatabaseIfConnected = async ()=>{
    if (!getIsConnected()) return;
    try {
        for (const u of DEFAULT_USERS){
            const exists = await User.findOne({
                email: u.email
            });
            if (!exists) {
                await User.create({
                    name: u.name,
                    email: u.email,
                    password: u.passwordHash,
                    phone: u.phone,
                    address: u.address,
                    role: u.role
                });
            }
        }
    } catch (err) {
    // ignore duplicate or background seed errors
    }
};
setTimeout(seedDatabaseIfConnected, 3000);
const getDepartmentId = async (departmentValue)=>{
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
            departmentName: {
                $regex: `^${escapedName}$`,
                $options: "i"
            }
        });
        if (!department) {
            department = await Department.create({
                departmentName: trimmed
            });
        }
        return department._id;
    } catch  {
        return null;
    }
};
// Register
const registerUser = async (req, res)=>{
    try {
        const { name, email, password, phone, address, role, department } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        const cleanEmail = email.trim().toLowerCase();
        const safeRole = normalizeRole(role) || "client";
        // 1. If MongoDB is connected, use Mongoose
        if (getIsConnected()) {
            const userExists = await User.findOne({
                email: cleanEmail
            });
            if (userExists) {
                return res.status(400).json({
                    message: "User already exists with this email"
                });
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
                department: departmentId
            });
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                address: user.address || "",
                role: user.role === "citizen" ? "client" : user.role,
                department: department || null,
                token: generateToken(user._id)
            });
        }
        // 2. Resilient In-Memory Fallback
        const existing = inMemoryUsers.find((u)=>u.email.toLowerCase() === cleanEmail);
        if (existing) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
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
            department: department || null
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
            token: generateToken(newUser._id)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Login
const loginUser = async (req, res)=>{
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide both email and password"
            });
        }
        const cleanEmail = email.trim().toLowerCase();
        // 1. If MongoDB is connected
        if (getIsConnected()) {
            const user = await User.findOne({
                email: {
                    $regex: `^${cleanEmail}$`,
                    $options: "i"
                }
            }).populate("department", "departmentName");
            if (user && await bcrypt.compare(password, user.password)) {
                // Check requested role matching if specified
                if (role) {
                    const reqRole = normalizeRole(role);
                    const userRole = normalizeRole(user.role);
                    if (reqRole && userRole && reqRole !== userRole) {
                        return res.status(401).json({
                            message: `This account is registered as '${user.role}'. Please use the matching portal tab.`
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
                    token: generateToken(user._id)
                });
            }
        }
        // 2. Check in-memory store (works if MongoDB is offline or for demo users)
        const memUser = inMemoryUsers.find((u)=>u.email.toLowerCase() === cleanEmail);
        if (memUser) {
            const match = await bcrypt.compare(password, memUser.passwordHash);
            if (match) {
                if (role) {
                    const reqRole = normalizeRole(role);
                    const userRole = normalizeRole(memUser.role);
                    if (reqRole && userRole && reqRole !== userRole) {
                        return res.status(401).json({
                            message: `This account is registered as '${memUser.role}'. Please use the matching portal tab.`
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
                    token: generateToken(memUser._id)
                });
            }
        }
        return res.status(401).json({
            message: "Invalid email or password. Check credentials or try one of the demo logins."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Get Profile
const getUserProfile = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const user = await User.findById(req.user._id).select("-password").populate("department", "departmentName");
            if (user) return res.json(user);
        }
        const memUser = inMemoryUsers.find((u)=>String(u._id) === String(req.user._id));
        if (memUser) {
            const { passwordHash, ...rest } = memUser;
            return res.json(rest);
        }
        res.status(404).json({
            message: "User not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Update Profile
const updateUserProfile = async (req, res)=>{
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
                    token: generateToken(updated._id)
                });
            }
        }
        const memUser = inMemoryUsers.find((u)=>String(u._id) === String(req.user._id));
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
                token: generateToken(memUser._id)
            });
        }
        res.status(404).json({
            message: "User not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Change Password
const changePassword = async (req, res)=>{
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }
        if (getIsConnected()) {
            const user = await User.findById(req.user._id);
            if (user) {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({
                        message: "Current password does not match records"
                    });
                }
                user.password = await bcrypt.hash(newPassword, 10);
                await user.save();
                return res.json({
                    message: "Password updated successfully"
                });
            }
        }
        const memUser = inMemoryUsers.find((u)=>String(u._id) === String(req.user._id));
        if (memUser) {
            const isMatch = await bcrypt.compare(currentPassword, memUser.passwordHash);
            if (!isMatch) {
                return res.status(400).json({
                    message: "Current password does not match records"
                });
            }
            memUser.passwordHash = await bcrypt.hash(newPassword, 10);
            return res.json({
                message: "Password updated successfully"
            });
        }
        res.status(404).json({
            message: "User not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    inMemoryUsers
};
}),
"[project]/lib/nextAdapter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { NextResponse } = __turbopack_context__.r("[project]/node_modules/next/server.js [app-route] (ecmascript)");
const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
const connectDB = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
};
async function authenticateRequest(request) {
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
        return {
            error: "Not authorized, no token provided",
            status: 401
        };
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
        await connectDB();
        let user = null;
        if (getIsConnected()) {
            try {
                user = await User.findById(decoded.id).select("-password");
            } catch  {
                user = null;
            }
        }
        if (!user) {
            const { inMemoryUsers } = __turbopack_context__.r("[project]/controllers/authController.js [app-route] (ecmascript)");
            const mem = inMemoryUsers.find((u)=>String(u._id) === String(decoded.id));
            if (mem) {
                user = {
                    _id: mem._id,
                    name: mem.name,
                    email: mem.email,
                    role: mem.role,
                    department: mem.department
                };
            }
        }
        if (!user) {
            return {
                error: "Not authorized, user not found",
                status: 401
            };
        }
        return {
            user
        };
    } catch (err) {
        return {
            error: "Not authorized, invalid token",
            status: 401
        };
    }
}
async function runHandler(handler, request, context = {}, options = {}) {
    await connectDB();
    // If OPTIONS preflight
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: corsHeaders
        });
    }
    let user = null;
    if (options.protect) {
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json({
                message: authResult.error
            }, {
                status: authResult.status,
                headers: corsHeaders
            });
        }
        user = authResult.user;
        if (options.role) {
            const userRole = (user.role || "").toLowerCase();
            if (options.role === "client" && userRole !== "client" && userRole !== "citizen") {
                return NextResponse.json({
                    message: "Access denied. Citizens only."
                }, {
                    status: 403,
                    headers: corsHeaders
                });
            }
            if (options.role === "officer" && userRole !== "officer" && userRole !== "admin") {
                return NextResponse.json({
                    message: "Access denied. Government Officers only."
                }, {
                    status: 403,
                    headers: corsHeaders
                });
            }
            if (options.role === "admin" && userRole !== "admin" && userRole !== "officer") {
                return NextResponse.json({
                    message: "Access denied. Admins only."
                }, {
                    status: 403,
                    headers: corsHeaders
                });
            }
        }
    }
    // Parse body
    let body = {};
    if ([
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ].includes(request.method)) {
        try {
            const text = await request.text();
            body = text ? JSON.parse(text) : {};
        } catch  {
            body = {};
        }
    }
    // Parse query params
    const urlObj = new URL(request.url);
    const query = Object.fromEntries(urlObj.searchParams.entries());
    // Parse route params (handle async params in Next.js 15+)
    const params = context.params ? await context.params : {};
    // Construct Express-compatible mock req and res
    let responseData = null;
    let responseStatus = 200;
    let headersSent = false;
    const mockReq = {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body,
        query,
        params,
        user,
        get: (name)=>request.headers.get(name)
    };
    return new Promise(async (resolve)=>{
        const mockRes = {
            status (code) {
                responseStatus = code;
                return this;
            },
            json (data) {
                if (!headersSent) {
                    headersSent = true;
                    responseData = data;
                    resolve(NextResponse.json(data, {
                        status: responseStatus,
                        headers: corsHeaders
                    }));
                }
                return this;
            },
            send (data) {
                if (!headersSent) {
                    headersSent = true;
                    responseData = data;
                    if (typeof data === "object") {
                        resolve(NextResponse.json(data, {
                            status: responseStatus,
                            headers: corsHeaders
                        }));
                    } else {
                        resolve(new NextResponse(data, {
                            status: responseStatus,
                            headers: corsHeaders
                        }));
                    }
                }
                return this;
            },
            setHeader () {
                return this;
            }
        };
        try {
            await handler(mockReq, mockRes);
        } catch (err) {
            console.error("Handler error:", err);
            if (!headersSent) {
                headersSent = true;
                resolve(NextResponse.json({
                    message: err.message || "Internal server error"
                }, {
                    status: 500,
                    headers: corsHeaders
                }));
            }
        }
    });
}
module.exports = {
    runHandler,
    corsHeaders,
    connectDB
};
}),
"[project]/models/Announcement.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Notice'
    },
    priority: {
        type: String,
        enum: [
            'High',
            'Medium',
            'Low'
        ],
        default: 'Medium'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiryDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
}),
"[project]/models/Department.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    headOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.Department || mongoose.model("Department", departmentSchema);
}),
"[project]/models/Notification.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: [
            "Complaint",
            "Announcement",
            "System"
        ]
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
}),
"[project]/models/User.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: [
            "client",
            "officer",
            "admin"
        ],
        default: "client"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
}),
"[project]/utils/generateToken.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
const generateToken = (id)=>{
    const secret = process.env.JWT_SECRET || "smart_grievance_jwt_secret_key_2026";
    return jwt.sign({
        id
    }, secret, {
        expiresIn: "7d"
    });
};
module.exports = generateToken;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1fh8vxr3-lkmj._.js.map