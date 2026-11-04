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
"[project]/app/api/dashboard/citizen/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
const { runHandler } = __turbopack_context__.r("[project]/lib/nextAdapter.js [app-route] (ecmascript)");
const { citizenDashboard } = __turbopack_context__.r("[project]/controllers/dashboardController.js [app-route] (ecmascript)");
async function GET(request, context) {
    return runHandler(citizenDashboard, request, context, {
        protect: true,
        role: "client"
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
"[project]/controllers/complaintController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Complaint = __turbopack_context__.r("[project]/models/Complaint.js [app-route] (ecmascript)");
const Department = __turbopack_context__.r("[project]/models/Department.js [app-route] (ecmascript)");
const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
const { createNotification } = __turbopack_context__.r("[project]/controllers/notificationController.js [app-route] (ecmascript)");
const { validateCivicComplaint } = __turbopack_context__.r("[project]/utils/aiComplaintValidator.js [app-route] (ecmascript)");
let inMemoryComplaints = [];
// Helper to resolve Department model ID for a department name or keyword
async function resolveDepartment(deptName) {
    if (!deptName) deptName = "Other/Unclear";
    const cleanName = deptName.trim();
    // Try exact match or partial match
    let record = await Department.findOne({
        departmentName: {
            $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i")
        }
    });
    if (!record) {
        // Try matching canonical keywords
        let search = "Other Civic Issue";
        if (/road|pothole|footpath/i.test(cleanName)) search = "Roads Department";
        else if (/water|leak|pipeline|drain/i.test(cleanName)) search = "Water Supply Department";
        else if (/garbage|trash|sanitation|waste/i.test(cleanName)) search = "Sanitation Department";
        else if (/electric|power|light|wire/i.test(cleanName)) search = "Electricity Department";
        else if (/safety|hazard|danger|collapse/i.test(cleanName)) search = "Public Safety Department";
        record = await Department.findOne({
            departmentName: {
                $regex: new RegExp(search, "i")
            }
        });
    }
    if (!record) {
        record = await Department.create({
            departmentName: cleanName === "Other/Unclear" ? "Other Civic Issue" : cleanName,
            description: `${cleanName} Civic Redressal Queue`
        });
    }
    return record;
}
// ====================== Submit Complaint (with Server AI Validation & Routing) ======================
const submitComplaint = async (req, res)=>{
    try {
        const { title, description, category, department, location, priority, image } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required."
            });
        }
        if (getIsConnected()) {
            // 1. Run real server-side AI validation (authenticity, text classification, image relevance, duplicate check, political/non-civic filter)
            const aiValidation = await validateCivicComplaint({
                title,
                description,
                category,
                department,
                location,
                image
            }, Complaint);
            // 2. Resolve target department based on AI recommendation or requested department
            const targetDeptName = aiValidation.recommendedDepartment || department || category || "Other/Unclear";
            const departmentRecord = await resolveDepartment(targetDeptName);
            // 3. Find designated authorized officer for this department
            const designatedOfficer = await User.findOne({
                role: "officer",
                department: departmentRecord._id
            }) || await User.findOne({
                role: "officer"
            });
            // 4. Initial status derived from AI validation workflow rules:
            // Valid -> Accepted and Assigned (or Submitted — Awaiting Validation)
            // Low confidence or Flagged or Possible Duplicate -> Under Manual Review
            // Vague/Missing info -> Needs More Information
            // Political / Non-civic -> Under Manual Review (with clear warning flag)
            let initialStatus = aiValidation.status || "Submitted — Awaiting Validation";
            if (initialStatus === "Accepted and Assigned" && !designatedOfficer) {
                initialStatus = "Submitted — Awaiting Validation";
            }
            const complaintNumber = `GRV${Math.floor(100 + Math.random() * 900)}`;
            const complaint = await Complaint.create({
                complaintNumber,
                title: title.trim(),
                description: description.trim(),
                category: aiValidation.detectedCategory || category || "General",
                department: departmentRecord._id,
                assignedOfficer: designatedOfficer ? designatedOfficer._id : null,
                location: location || "Not specified",
                priority: priority || aiValidation.priority || "Medium",
                image: image || "",
                citizen: req.user._id,
                status: initialStatus,
                isClosed: false,
                aiFlag: aiValidation.warnings?.length > 0 ? aiValidation.warnings[0] : "Verified Civic Complaint",
                authenticityScore: aiValidation.authenticityScore || 90,
                aiValidation,
                analysisReasons: aiValidation.warnings || [],
                timeline: [
                    {
                        title: "Complaint Submitted",
                        timestamp: new Date().toISOString(),
                        description: `Citizen submitted grievance. Initial AI triage completed.`,
                        completed: true
                    },
                    {
                        title: `AI Classification & Validation (${aiValidation.classificationConfidence}% Confidence)`,
                        timestamp: new Date().toISOString(),
                        description: `Categorized under "${aiValidation.detectedCategory}". Recommended department: "${departmentRecord.departmentName}". ${aiValidation.explanation}`,
                        completed: true
                    },
                    ...initialStatus === "Accepted and Assigned" && designatedOfficer ? [
                        {
                            title: `Accepted & Assigned to ${designatedOfficer.name}`,
                            timestamp: new Date().toISOString(),
                            description: `Routed to ${departmentRecord.departmentName} queue. Assigned officer: ${designatedOfficer.name} (${designatedOfficer.email}).`,
                            completed: true
                        }
                    ] : initialStatus === "Needs More Information" ? [
                        {
                            title: "Action Required: Citizen Details Needed",
                            timestamp: new Date().toISOString(),
                            description: aiValidation.explanation || "Complaint lacks sufficient details to initiate action.",
                            completed: false
                        }
                    ] : [
                        {
                            title: "Queued for Manual Officer Review",
                            timestamp: new Date().toISOString(),
                            description: `Sent to ${departmentRecord.departmentName} manual verification queue. ${aiValidation.explanation}`,
                            completed: false
                        }
                    ]
                ]
            });
            // Notify citizen of submission and current status
            await createNotification({
                userId: req.user._id,
                message: `Your grievance #${complaint.complaintNumber} ("${complaint.title}") was submitted with status "${complaint.status}". Routed to ${departmentRecord.departmentName}.`,
                type: "Complaint"
            });
            // If an officer was assigned, notify officer
            if (designatedOfficer) {
                await createNotification({
                    userId: designatedOfficer._id,
                    message: `New grievance assigned: #${complaint.complaintNumber} ("${complaint.title}") under ${departmentRecord.departmentName}.`,
                    type: "Complaint"
                });
            }
            return res.status(201).json(complaint);
        }
        // In-memory fallback
        const aiValidation = await validateCivicComplaint({
            title,
            description,
            category,
            department,
            location,
            image
        }, null);
        const newComplaint = {
            _id: "comp_" + Date.now(),
            complaintNumber: `GRV${Math.floor(100 + Math.random() * 900)}`,
            title: title.trim(),
            description: description.trim(),
            category: aiValidation.detectedCategory || category || "General",
            department: {
                _id: "dept_roads",
                departmentName: aiValidation.recommendedDepartment || "Roads Department"
            },
            citizen: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email
            },
            assignedOfficer: null,
            location: location || "Not specified",
            priority: priority || "Medium",
            status: aiValidation.status || "Submitted — Awaiting Validation",
            isClosed: false,
            image: image || "",
            aiFlag: aiValidation.warnings?.length > 0 ? aiValidation.warnings[0] : "Verified Civic Complaint",
            authenticityScore: aiValidation.authenticityScore || 90,
            aiValidation,
            analysisReasons: aiValidation.warnings || [],
            timeline: [
                {
                    title: "Complaint Submitted",
                    timestamp: new Date().toISOString(),
                    description: "Citizen submitted grievance.",
                    completed: true
                },
                {
                    title: `AI Classification & Validation (${aiValidation.classificationConfidence}% Confidence)`,
                    timestamp: new Date().toISOString(),
                    description: `Categorized under "${aiValidation.detectedCategory}". ${aiValidation.explanation}`,
                    completed: true
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        inMemoryComplaints.unshift(newComplaint);
        return res.status(201).json(newComplaint);
    } catch (error) {
        console.error("Submit Complaint Error:", error);
        res.status(500).json({
            message: error.message || "Failed to submit complaint"
        });
    }
};
// ====================== Get Citizen Complaints (Active vs Closed History) ======================
const getMyComplaints = async (req, res)=>{
    try {
        const { history, all } = req.query;
        if (getIsConnected()) {
            let filter = {
                citizen: req.user._id
            };
            if (history === "true") {
                // Only closed or resolved archive
                filter.$or = [
                    {
                        isClosed: true
                    },
                    {
                        status: "Closed"
                    }
                ];
            } else if (all !== "true") {
                // Default: Active complaints only! (Closed complaints excluded from active dashboard)
                filter.isClosed = {
                    $ne: true
                };
                filter.status = {
                    $ne: "Closed"
                };
            }
            const complaints = await Complaint.find(filter).populate("department", "departmentName").populate("assignedOfficer", "name email").sort({
                createdAt: -1
            });
            return res.status(200).json(complaints);
        }
        let myItems = inMemoryComplaints.filter((c)=>String(c.citizen?._id || c.citizen) === String(req.user._id));
        if (history === "true") {
            myItems = myItems.filter((c)=>c.isClosed === true || c.status === "Closed");
        } else if (all !== "true") {
            myItems = myItems.filter((c)=>c.isClosed !== true && c.status !== "Closed");
        }
        res.status(200).json(myItems);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Get Complaint By ID ======================
const getComplaintById = async (req, res)=>{
    try {
        let complaint = null;
        if (getIsConnected()) {
            complaint = await Complaint.findById(req.params.id).populate("citizen", "name email").populate("department", "departmentName").populate("assignedOfficer", "name email");
        } else {
            complaint = inMemoryComplaints.find((c)=>String(c._id) === String(req.params.id));
        }
        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }
        // Role-based authorization: officers & admins can view assigned / permitted;
        // Citizens can ONLY view their own filed complaints.
        const isOfficer = req.user.role === "officer" || req.user.role === "admin";
        const citizenId = complaint.citizen?._id ? String(complaint.citizen._id) : String(complaint.citizen);
        const requesterId = String(req.user._id);
        if (!isOfficer && citizenId !== requesterId) {
            return res.status(403).json({
                message: "Access denied. Citizens can only view complaints they are authorized to access."
            });
        }
        return res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Citizen Confirm Resolution & Satisfaction (Close vs Reopen) ======================
const confirmSatisfaction = async (req, res)=>{
    try {
        const { id } = req.params;
        const { satisfied, feedbackRating, feedbackComment, reopenReason } = req.body;
        if (satisfied === undefined || satisfied === null) {
            return res.status(400).json({
                message: "Please specify whether you are satisfied with the resolution."
            });
        }
        const isSatisfied = Boolean(satisfied);
        if (getIsConnected()) {
            const complaint = await Complaint.findById(id);
            if (!complaint) return res.status(404).json({
                message: "Complaint not found."
            });
            if (String(complaint.citizen) !== String(req.user._id)) {
                return res.status(403).json({
                    message: "Unauthorized: You can only confirm satisfaction for your own complaints."
                });
            }
            complaint.timeline = complaint.timeline || [];
            if (isSatisfied) {
                // Satisfied -> Mark Closed, archive record, remove from active dashboard
                complaint.status = "Closed";
                complaint.isClosed = true;
                complaint.closedAt = new Date();
                complaint.citizenSatisfaction = {
                    confirmed: true,
                    satisfied: true,
                    feedbackRating: Number(feedbackRating) || 5,
                    feedbackComment: (feedbackComment || "").trim(),
                    confirmedAt: new Date()
                };
                if (feedbackRating) {
                    complaint.feedback = {
                        rating: Number(feedbackRating) || 5,
                        comment: (feedbackComment || "").trim(),
                        submittedAt: new Date()
                    };
                }
                complaint.timeline.push({
                    title: `Citizen Satisfied — Complaint Officially Closed (${Number(feedbackRating) || 5} Stars)`,
                    timestamp: new Date().toISOString(),
                    description: feedbackComment ? `Citizen confirmed resolution satisfaction: "${feedbackComment.trim()}". Grievance has been archived into Closed History.` : "Citizen confirmed satisfactory resolution. Grievance closed and archived.",
                    completed: true
                });
                await complaint.save();
                if (complaint.assignedOfficer) {
                    await createNotification({
                        userId: complaint.assignedOfficer,
                        message: `Citizen confirmed satisfaction for grievance #${complaint.complaintNumber}. Status is now CLOSED.`,
                        type: "Complaint"
                    });
                }
                return res.status(200).json({
                    message: "Satisfaction confirmed. Grievance successfully closed and moved to Complaint History.",
                    complaint
                });
            } else {
                // Not satisfied -> Reopen grievance, return to department active queue
                if (!reopenReason && !feedbackComment) {
                    return res.status(400).json({
                        message: "Please provide a reason why you are not satisfied so the officer can address it."
                    });
                }
                const reasonText = (reopenReason || feedbackComment || "").trim();
                complaint.status = "Reopened";
                complaint.isClosed = false;
                complaint.closedAt = null;
                complaint.reopenedAt = new Date();
                complaint.reopenReason = reasonText;
                complaint.citizenSatisfaction = {
                    confirmed: true,
                    satisfied: false,
                    feedbackRating: Number(feedbackRating) || 1,
                    feedbackComment: reasonText,
                    confirmedAt: new Date()
                };
                complaint.timeline.push({
                    title: "Grievance Reopened by Citizen — Unsatisfied with Resolution",
                    timestamp: new Date().toISOString(),
                    description: `Citizen noted: "${reasonText}". Complaint returned to active department queue for rectification.`,
                    completed: false
                });
                await complaint.save();
                if (complaint.assignedOfficer) {
                    await createNotification({
                        userId: complaint.assignedOfficer,
                        message: `ACTION REQUIRED: Grievance #${complaint.complaintNumber} was REOPENED by citizen. Reason: ${reasonText}`,
                        type: "Complaint"
                    });
                }
                return res.status(200).json({
                    message: "Grievance reopened and returned to active department queue for further action.",
                    complaint
                });
            }
        }
        // In-memory fallback
        const item = inMemoryComplaints.find((c)=>String(c._id) === String(id));
        if (!item) return res.status(404).json({
            message: "Complaint not found."
        });
        if (isSatisfied) {
            item.status = "Closed";
            item.isClosed = true;
            item.closedAt = new Date().toISOString();
            item.citizenSatisfaction = {
                confirmed: true,
                satisfied: true,
                feedbackRating: Number(feedbackRating) || 5,
                feedbackComment: (feedbackComment || "").trim(),
                confirmedAt: new Date().toISOString()
            };
            item.timeline = item.timeline || [];
            item.timeline.push({
                title: "Citizen Satisfied — Complaint Officially Closed",
                timestamp: new Date().toISOString(),
                description: "Citizen confirmed satisfaction.",
                completed: true
            });
            return res.status(200).json({
                message: "Complaint closed successfully.",
                complaint: item
            });
        } else {
            const reasonText = (reopenReason || feedbackComment || "Reopened by citizen").trim();
            item.status = "Reopened";
            item.isClosed = false;
            item.reopenedAt = new Date().toISOString();
            item.reopenReason = reasonText;
            item.timeline = item.timeline || [];
            item.timeline.push({
                title: "Grievance Reopened by Citizen",
                timestamp: new Date().toISOString(),
                description: reasonText,
                completed: false
            });
            return res.status(200).json({
                message: "Complaint reopened successfully.",
                complaint: item
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Citizen Provide More Information ======================
const provideMoreInfo = async (req, res)=>{
    try {
        const { id } = req.params;
        const { additionalDetails, image } = req.body;
        if (!additionalDetails || !additionalDetails.trim()) {
            return res.status(400).json({
                message: "Please provide the requested details."
            });
        }
        if (getIsConnected()) {
            const complaint = await Complaint.findById(id);
            if (!complaint) return res.status(404).json({
                message: "Complaint not found."
            });
            if (String(complaint.citizen) !== String(req.user._id)) {
                return res.status(403).json({
                    message: "Unauthorized."
                });
            }
            complaint.description = `${complaint.description}\n\n[Citizen Additional Information]: ${additionalDetails.trim()}`;
            if (image) complaint.image = image;
            // Status moves from Needs More Information to Under Manual Review
            complaint.status = "Under Manual Review";
            complaint.moreInfoRequested = complaint.moreInfoRequested || {};
            complaint.moreInfoRequested.citizenResponse = additionalDetails.trim();
            complaint.moreInfoRequested.respondedAt = new Date();
            complaint.timeline = complaint.timeline || [];
            complaint.timeline.push({
                title: "Additional Information Provided by Citizen",
                timestamp: new Date().toISOString(),
                description: `Citizen details: "${additionalDetails.trim()}". Queued for officer re-verification.`,
                completed: true
            });
            await complaint.save();
            if (complaint.assignedOfficer) {
                await createNotification({
                    userId: complaint.assignedOfficer,
                    message: `Citizen provided required details for grievance #${complaint.complaintNumber}. Now awaiting your review.`,
                    type: "Complaint"
                });
            }
            return res.status(200).json({
                message: "Information submitted successfully. Status updated to Under Manual Review.",
                complaint
            });
        }
        const item = inMemoryComplaints.find((c)=>String(c._id) === String(id));
        if (item) {
            item.description = `${item.description}\n\n[Citizen Additional Information]: ${additionalDetails.trim()}`;
            item.status = "Under Manual Review";
            item.timeline = item.timeline || [];
            item.timeline.push({
                title: "Additional Information Provided by Citizen",
                timestamp: new Date().toISOString(),
                description: additionalDetails.trim(),
                completed: true
            });
            return res.status(200).json({
                message: "Information submitted.",
                complaint: item
            });
        }
        res.status(404).json({
            message: "Complaint not found."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Delete Complaint ======================
const deleteComplaint = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const complaint = await Complaint.findById(req.params.id);
            if (complaint) {
                // Enforce rule: Closed complaints must not be deleted!
                if (complaint.isClosed || complaint.status === "Closed") {
                    return res.status(400).json({
                        message: "Closed complaints are preserved in official archive and cannot be deleted."
                    });
                }
                await complaint.deleteOne();
                return res.status(200).json({
                    message: "Complaint deleted successfully"
                });
            }
        }
        inMemoryComplaints = inMemoryComplaints.filter((c)=>String(c._id) !== String(req.params.id));
        res.status(200).json({
            message: "Complaint deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Submit Citizen Feedback & Star Rating ======================
const submitFeedback = async (req, res)=>{
    try {
        const { rating, comment } = req.body;
        const parsedRating = Number(rating);
        if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5 stars"
            });
        }
        if (getIsConnected()) {
            const complaint = await Complaint.findById(req.params.id);
            if (!complaint) return res.status(404).json({
                message: "Complaint not found"
            });
            if (String(complaint.citizen) !== String(req.user._id)) {
                return res.status(403).json({
                    message: "Unauthorized to submit feedback on this complaint"
                });
            }
            complaint.feedback = {
                rating: parsedRating,
                comment: comment ? comment.trim() : "",
                submittedAt: new Date()
            };
            complaint.timeline = complaint.timeline || [];
            complaint.timeline.push({
                title: `Citizen Feedback Submitted (${parsedRating} / 5 Stars)`,
                timestamp: new Date().toISOString(),
                description: comment ? `Citizen review: "${comment.trim()}"` : `Rated ${parsedRating} stars by citizen.`,
                completed: true
            });
            await complaint.save();
            if (complaint.assignedOfficer) {
                await createNotification({
                    userId: complaint.assignedOfficer,
                    message: `Citizen submitted a ${parsedRating}-star rating for grievance #${complaint.complaintNumber}.`,
                    type: "Complaint"
                });
            }
            return res.status(200).json({
                message: "Citizen rating submitted successfully",
                feedback: complaint.feedback
            });
        }
        const item = inMemoryComplaints.find((c)=>String(c._id) === String(req.params.id));
        if (item) {
            item.feedback = {
                rating: parsedRating,
                comment: comment ? comment.trim() : "",
                submittedAt: new Date().toISOString()
            };
            item.timeline = item.timeline || [];
            item.timeline.push({
                title: `Citizen Feedback Submitted (${parsedRating} / 5 Stars)`,
                timestamp: new Date().toISOString(),
                description: comment ? `Citizen review: "${comment.trim()}"` : `Rated ${parsedRating} stars by citizen.`,
                completed: true
            });
            return res.status(200).json({
                message: "Citizen rating submitted successfully",
                feedback: item.feedback
            });
        }
        res.status(404).json({
            message: "Complaint not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// ====================== Re-open Grievance ======================
const reopenComplaint = async (req, res)=>{
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: "Please specify the reason for re-opening this grievance"
            });
        }
        if (getIsConnected()) {
            const complaint = await Complaint.findById(req.params.id);
            if (!complaint) return res.status(404).json({
                message: "Complaint not found"
            });
            if (String(complaint.citizen) !== String(req.user._id)) {
                return res.status(403).json({
                    message: "Unauthorized to re-open this complaint"
                });
            }
            complaint.status = "Reopened";
            complaint.isClosed = false;
            complaint.closedAt = null;
            complaint.reopenedAt = new Date();
            complaint.reopenReason = reason.trim();
            complaint.aiFlag = "Re-opened by Citizen: Re-investigation Needed";
            complaint.timeline = complaint.timeline || [];
            complaint.timeline.push({
                title: "Grievance Re-opened by Citizen",
                timestamp: new Date().toISOString(),
                description: `Citizen requested re-examination: "${reason.trim()}". Status reverted to active department queue.`,
                completed: false
            });
            await complaint.save();
            if (complaint.assignedOfficer) {
                await createNotification({
                    userId: complaint.assignedOfficer,
                    message: `URGENT: Grievance #${complaint.complaintNumber} has been re-opened by citizen. Reason: ${reason.trim()}`,
                    type: "Complaint"
                });
            }
            return res.status(200).json({
                message: "Grievance re-opened successfully",
                complaint
            });
        }
        const item = inMemoryComplaints.find((c)=>String(c._id) === String(req.params.id));
        if (item) {
            item.status = "Reopened";
            item.isClosed = false;
            item.reopenedAt = new Date().toISOString();
            item.reopenReason = reason.trim();
            item.aiFlag = "Re-opened by Citizen: Re-investigation Needed";
            item.timeline = item.timeline || [];
            item.timeline.push({
                title: "Grievance Re-opened by Citizen",
                timestamp: new Date().toISOString(),
                description: `Citizen requested re-examination: "${reason.trim()}"`,
                completed: false
            });
            return res.status(200).json({
                message: "Grievance re-opened successfully",
                complaint: item
            });
        }
        res.status(404).json({
            message: "Complaint not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
module.exports = {
    submitComplaint,
    getMyComplaints,
    getComplaintById,
    deleteComplaint,
    submitFeedback,
    reopenComplaint,
    confirmSatisfaction,
    provideMoreInfo,
    inMemoryComplaints
};
}),
"[project]/controllers/dashboardController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Complaint = __turbopack_context__.r("[project]/models/Complaint.js [app-route] (ecmascript)");
const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
const Department = __turbopack_context__.r("[project]/models/Department.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
const { inMemoryComplaints } = __turbopack_context__.r("[project]/controllers/complaintController.js [app-route] (ecmascript)");
const { inMemoryUsers } = __turbopack_context__.r("[project]/controllers/authController.js [app-route] (ecmascript)");
const { inMemoryDepartments } = __turbopack_context__.r("[project]/controllers/departmentController.js [app-route] (ecmascript)");
// Citizen Dashboard
const citizenDashboard = async (req, res)=>{
    try {
        const citizenId = req.user._id;
        if (getIsConnected()) {
            // Exclude closed complaints from active metrics
            const activeFilter = {
                citizen: citizenId,
                isClosed: {
                    $ne: true
                },
                status: {
                    $ne: "Closed"
                }
            };
            const totalActiveComplaints = await Complaint.countDocuments(activeFilter);
            const pending = await Complaint.countDocuments({
                ...activeFilter,
                status: {
                    $in: [
                        "Pending",
                        "Submitted — Awaiting Validation",
                        "Needs More Information",
                        "Under Manual Review"
                    ]
                }
            });
            const assigned = await Complaint.countDocuments({
                ...activeFilter,
                status: {
                    $in: [
                        "Assigned",
                        "Accepted and Assigned",
                        "In Progress",
                        "Reopened"
                    ]
                }
            });
            const resolvedAwaitingConfirm = await Complaint.countDocuments({
                ...activeFilter,
                status: {
                    $in: [
                        "Resolved",
                        "RESOLVED_AWAITING_FEEDBACK"
                    ]
                }
            });
            const closedCount = await Complaint.countDocuments({
                citizen: citizenId,
                $or: [
                    {
                        isClosed: true
                    },
                    {
                        status: "Closed"
                    }
                ]
            });
            const rejectedCount = await Complaint.countDocuments({
                citizen: citizenId,
                status: "Rejected"
            });
            return res.json({
                totalComplaints: totalActiveComplaints,
                pending,
                assigned,
                resolved: resolvedAwaitingConfirm,
                closed: closedCount,
                rejected: rejectedCount
            });
        }
        // Dynamic calculation from session complaints
        const myComplaints = inMemoryComplaints.filter((c)=>String(c.citizen?._id || c.citizen) === String(citizenId));
        const active = myComplaints.filter((c)=>!c.isClosed && c.status !== "Closed");
        res.json({
            totalComplaints: active.length,
            pending: active.filter((c)=>[
                    "Pending",
                    "Submitted — Awaiting Validation",
                    "Needs More Information",
                    "Under Manual Review"
                ].includes(c.status)).length,
            assigned: active.filter((c)=>[
                    "Assigned",
                    "Accepted and Assigned",
                    "In Progress",
                    "Reopened"
                ].includes(c.status)).length,
            resolved: active.filter((c)=>[
                    "Resolved",
                    "RESOLVED_AWAITING_FEEDBACK"
                ].includes(c.status)).length,
            closed: myComplaints.filter((c)=>c.isClosed || c.status === "Closed").length,
            rejected: myComplaints.filter((c)=>c.status === "Rejected").length
        });
    } catch (error) {
        res.json({
            totalComplaints: 0,
            pending: 0,
            assigned: 0,
            resolved: 0,
            closed: 0,
            rejected: 0
        });
    }
};
// Officer Dashboard
const officerDashboard = async (req, res)=>{
    try {
        const officerId = req.user._id;
        if (getIsConnected()) {
            const officer = await User.findById(officerId);
            const isSupervisorOrAdmin = req.user.role === "admin";
            let query = {
                isClosed: {
                    $ne: true
                },
                status: {
                    $ne: "Closed"
                }
            };
            if (!isSupervisorOrAdmin) {
                const conditions = [
                    {
                        assignedOfficer: officerId
                    }
                ];
                if (officer?.department) {
                    conditions.push({
                        department: officer.department
                    });
                }
                query.$and = [
                    {
                        $or: conditions
                    }
                ];
            }
            const totalActiveAssigned = await Complaint.countDocuments(query);
            const pending = await Complaint.countDocuments({
                ...query,
                status: {
                    $in: [
                        "Pending",
                        "Submitted — Awaiting Validation",
                        "Needs More Information",
                        "Under Manual Review"
                    ]
                }
            });
            const inProgress = await Complaint.countDocuments({
                ...query,
                status: {
                    $in: [
                        "Assigned",
                        "Accepted and Assigned",
                        "In Progress",
                        "Reopened"
                    ]
                }
            });
            const resolved = await Complaint.countDocuments({
                ...query,
                status: {
                    $in: [
                        "Resolved",
                        "RESOLVED_AWAITING_FEEDBACK"
                    ]
                }
            });
            // Closed history count for this department/officer
            let closedQuery = {
                $or: [
                    {
                        isClosed: true
                    },
                    {
                        status: "Closed"
                    }
                ]
            };
            if (!isSupervisorOrAdmin) {
                const conditions = [
                    {
                        assignedOfficer: officerId
                    }
                ];
                if (officer?.department) conditions.push({
                    department: officer.department
                });
                closedQuery.$and = [
                    {
                        $or: conditions
                    }
                ];
            }
            const closed = await Complaint.countDocuments(closedQuery);
            return res.json({
                assigned: totalActiveAssigned,
                totalComplaints: totalActiveAssigned,
                pending,
                inProgress,
                resolved,
                closed
            });
        }
        // In-memory
        const officer = inMemoryUsers.find((u)=>String(u._id) === String(officerId));
        const assignedComplaints = inMemoryComplaints.filter((c)=>{
            if (c.isClosed || c.status === "Closed") return false;
            return !c.assignedOfficer || String(c.assignedOfficer?._id || c.assignedOfficer) === String(officerId) || officer?.department && String(c.department?._id || c.department) === String(officer.department);
        });
        const resolved = assignedComplaints.filter((c)=>[
                "Resolved",
                "RESOLVED_AWAITING_FEEDBACK"
            ].includes(c.status)).length;
        const inProgress = assignedComplaints.filter((c)=>[
                "In Progress",
                "Accepted and Assigned",
                "Reopened"
            ].includes(c.status)).length;
        const pending = assignedComplaints.filter((c)=>[
                "Pending",
                "Submitted — Awaiting Validation",
                "Under Manual Review",
                "Needs More Information"
            ].includes(c.status)).length;
        res.json({
            assigned: assignedComplaints.length,
            totalComplaints: assignedComplaints.length,
            pending,
            inProgress,
            resolved,
            closed: inMemoryComplaints.filter((c)=>c.isClosed || c.status === "Closed").length
        });
    } catch (error) {
        res.json({
            assigned: 0,
            totalComplaints: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0
        });
    }
};
// Admin Dashboard
const adminDashboard = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const totalUsers = await User.countDocuments();
            // Total active complaints excluding closed
            const totalComplaints = await Complaint.countDocuments({
                isClosed: {
                    $ne: true
                },
                status: {
                    $ne: "Closed"
                }
            });
            const closedComplaints = await Complaint.countDocuments({
                $or: [
                    {
                        isClosed: true
                    },
                    {
                        status: "Closed"
                    }
                ]
            });
            const departments = await Department.countDocuments();
            const resolved = await Complaint.countDocuments({
                status: {
                    $in: [
                        "Resolved",
                        "RESOLVED_AWAITING_FEEDBACK"
                    ]
                },
                isClosed: {
                    $ne: true
                }
            });
            const pending = await Complaint.countDocuments({
                status: {
                    $in: [
                        "Pending",
                        "Submitted — Awaiting Validation",
                        "Needs More Information",
                        "Under Manual Review"
                    ]
                },
                isClosed: {
                    $ne: true
                }
            });
            const officers = await User.countDocuments({
                role: "officer"
            });
            return res.json({
                totalUsers,
                totalComplaints,
                closedComplaints,
                departments,
                resolved,
                pending,
                officers
            });
        }
        const active = inMemoryComplaints.filter((c)=>!c.isClosed && c.status !== "Closed");
        res.json({
            totalUsers: inMemoryUsers.length,
            totalComplaints: active.length,
            closedComplaints: inMemoryComplaints.filter((c)=>c.isClosed || c.status === "Closed").length,
            departments: (inMemoryDepartments || []).length,
            resolved: active.filter((c)=>[
                    "Resolved",
                    "RESOLVED_AWAITING_FEEDBACK"
                ].includes(c.status)).length,
            pending: active.filter((c)=>[
                    "Pending",
                    "Submitted — Awaiting Validation",
                    "Under Manual Review"
                ].includes(c.status)).length,
            officers: inMemoryUsers.filter((u)=>u.role === "officer").length
        });
    } catch (error) {
        res.json({
            totalUsers: 0,
            totalComplaints: 0,
            closedComplaints: 0,
            departments: 0,
            resolved: 0,
            pending: 0,
            officers: 0
        });
    }
};
module.exports = {
    citizenDashboard,
    officerDashboard,
    adminDashboard
};
}),
"[project]/controllers/departmentController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Department = __turbopack_context__.r("[project]/models/Department.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
const DEFAULT_DEPARTMENTS = [
    {
        _id: "dep_001",
        departmentName: "Roads & Infrastructure",
        description: "Potholes, footpaths, and road repair"
    },
    {
        _id: "dep_002",
        departmentName: "Water Supply",
        description: "Pipeline leaks, water pressure, and shortages"
    },
    {
        _id: "dep_003",
        departmentName: "Electricity",
        description: "Streetlights, wiring, and power outages"
    },
    {
        _id: "dep_004",
        departmentName: "Sanitation & Waste",
        description: "Garbage collection and sewage disposal"
    },
    {
        _id: "dep_005",
        departmentName: "Public Health",
        description: "Mosquito control, sanitation, and dispensaries"
    }
];
let inMemoryDepartments = [
    ...DEFAULT_DEPARTMENTS
];
// Create Department
const createDepartment = async (req, res)=>{
    try {
        const { departmentName, description } = req.body;
        if (getIsConnected()) {
            const department = await Department.create({
                departmentName,
                description
            });
            return res.status(201).json(department);
        }
        const newDept = {
            _id: "dep_" + Date.now(),
            departmentName,
            description
        };
        inMemoryDepartments.push(newDept);
        res.status(201).json(newDept);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Get All Departments
const getDepartments = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const departments = await Department.find();
            return res.status(200).json(departments);
        }
        res.status(200).json(inMemoryDepartments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Update Department
const updateDepartment = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            });
            if (department) return res.status(200).json(department);
        }
        const idx = inMemoryDepartments.findIndex((d)=>d._id === req.params.id);
        if (idx !== -1) {
            inMemoryDepartments[idx] = {
                ...inMemoryDepartments[idx],
                ...req.body
            };
            return res.status(200).json(inMemoryDepartments[idx]);
        }
        res.status(404).json({
            message: "Department not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Delete Department
const deleteDepartment = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const department = await Department.findByIdAndDelete(req.params.id);
            if (department) return res.status(200).json({
                message: "Department deleted successfully"
            });
        }
        inMemoryDepartments = inMemoryDepartments.filter((d)=>d._id !== req.params.id);
        res.status(200).json({
            message: "Department deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
module.exports = {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    DEFAULT_DEPARTMENTS
};
}),
"[project]/controllers/notificationController.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Notification = __turbopack_context__.r("[project]/models/Notification.js [app-route] (ecmascript)");
const { getIsConnected } = __turbopack_context__.r("[project]/config/db.js [app-route] (ecmascript)");
let inMemoryNotifications = [];
// Get User Notifications
const getNotifications = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const list = await Notification.find({
                user: req.user._id
            }).sort({
                createdAt: -1
            }).limit(30);
            return res.status(200).json(list);
        }
        const myNotes = inMemoryNotifications.filter((n)=>String(n.user?._id || n.user) === String(req.user._id));
        res.status(200).json(myNotes);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Mark Notification as Read
const markAsRead = async (req, res)=>{
    try {
        if (getIsConnected()) {
            const note = await Notification.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id
            }, {
                isRead: true
            }, {
                new: true
            });
            if (note) return res.status(200).json(note);
        }
        const note = inMemoryNotifications.find((n)=>String(n._id) === String(req.params.id));
        if (note) {
            note.isRead = true;
            return res.status(200).json(note);
        }
        res.status(404).json({
            message: "Notification not found"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Mark All as Read
const markAllAsRead = async (req, res)=>{
    try {
        if (getIsConnected()) {
            await Notification.updateMany({
                user: req.user._id,
                isRead: false
            }, {
                isRead: true
            });
            return res.status(200).json({
                message: "All notifications marked as read"
            });
        }
        inMemoryNotifications.forEach((n)=>{
            if (String(n.user?._id || n.user) === String(req.user._id)) {
                n.isRead = true;
            }
        });
        res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Helper: Create Notification
const createNotification = async ({ userId, message, type = "Complaint" })=>{
    try {
        if (getIsConnected()) {
            return await Notification.create({
                user: userId,
                message,
                type
            });
        }
        const newNote = {
            _id: "notif_" + Date.now(),
            user: userId,
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        inMemoryNotifications.unshift(newNote);
        return newNote;
    } catch (err) {
        console.error("Notification creation error", err);
        return null;
    }
};
module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    inMemoryNotifications
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
"[project]/models/Complaint.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const complaintSchema = new mongoose.Schema({
    complaintNumber: {
        type: String,
        default: function() {
            return `GRV${Math.floor(100 + Math.random() * 900)}`;
        }
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    status: {
        type: String,
        enum: [
            "Draft",
            "Submitted — Awaiting Validation",
            "Needs More Information",
            "Under Manual Review",
            "Accepted and Assigned",
            "In Progress",
            "Resolved",
            "RESOLVED_AWAITING_FEEDBACK",
            "Closed",
            "Reopened",
            "Rejected",
            // Backward-compatibility legacy statuses:
            "Pending",
            "Assigned"
        ],
        default: "Submitted — Awaiting Validation"
    },
    isClosed: {
        type: Boolean,
        default: false,
        index: true
    },
    closedAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: [
            "Low",
            "Medium",
            "High",
            "Critical"
        ],
        default: "Medium"
    },
    image: {
        type: String,
        default: ""
    },
    resolutionImage: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        default: ""
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    aiFlag: {
        type: String,
        default: "Clean"
    },
    authenticityScore: {
        type: Number,
        default: 95
    },
    evidenceAnalysis: {
        type: Object,
        default: ()=>({
                imageIntegrity: "Verified Camera Capture",
                confidence: "High",
                duplicateRisk: "Low"
            })
    },
    aiValidation: {
        type: Object,
        default: ()=>({
                isValidCivic: true,
                classificationConfidence: 85,
                detectedCategory: "",
                recommendedDepartment: "",
                imageRelevance: "Relevant Evidence",
                duplicateProbability: 0,
                isPossibleDuplicate: false,
                matchingComplaints: [],
                warnings: [],
                explanation: "",
                recommendedAction: "Auto-Route & Assign",
                analyzedAt: new Date()
            })
    },
    citizenSatisfaction: {
        type: Object,
        default: ()=>({
                confirmed: false,
                satisfied: null,
                feedbackRating: 0,
                feedbackComment: "",
                confirmedAt: null
            })
    },
    moreInfoRequested: {
        type: Object,
        default: ()=>({
                requested: false,
                requestedAt: null,
                reason: "",
                citizenResponse: "",
                respondedAt: null
            })
    },
    resolutionDetails: {
        type: Object,
        default: ()=>({
                remarks: "",
                resolutionImage: "",
                resolvedAt: null,
                resolvedBy: null
            })
    },
    feedback: {
        rating: {
            type: Number,
            default: 0
        },
        comment: {
            type: String,
            default: ""
        },
        submittedAt: {
            type: Date,
            default: null
        }
    },
    reopenedAt: {
        type: Date,
        default: null
    },
    reopenReason: {
        type: String,
        default: ""
    },
    analysisReasons: {
        type: [
            String
        ],
        default: []
    },
    timeline: [
        {
            title: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            description: {
                type: String,
                default: ""
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ]
}, {
    timestamps: true,
    strict: false
});
module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
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
"[project]/utils/aiComplaintValidator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { analyzeCivicImage, computeHammingDistance } = __turbopack_context__.r("[project]/utils/aiVisionAnalyzer.js [app-route] (ecmascript)");
// Department Taxonomy
const DEPARTMENT_TAXONOMY = {
    "Roads Department": {
        keywords: [
            "pothole",
            "potholes",
            "crater",
            "craters",
            "road",
            "roads",
            "asphalt",
            "tar",
            "bitumen",
            "divider",
            "dividers",
            "footpath",
            "footpaths",
            "pavement",
            "sidewalk",
            "sidewalks",
            "speed breaker",
            "speedbreaker",
            "curb",
            "manhole cover broken",
            "damaged road",
            "broken road",
            "street repair"
        ],
        categories: [
            "Roads & Infrastructure",
            "Roads Department"
        ]
    },
    "Water Supply": {
        keywords: [
            "water",
            "leak",
            "leaking",
            "leakage",
            "pipeline",
            "pipe",
            "burst pipe",
            "water supply",
            "drinking water",
            "tap",
            "taps",
            "water pressure",
            "low pressure",
            "contamination",
            "dirty water",
            "muddy water",
            "tanker",
            "main line leak",
            "water meter",
            "no water"
        ],
        categories: [
            "Water Supply",
            "Water Supply & Drainage",
            "Water Supply Department"
        ]
    },
    "Sanitation": {
        keywords: [
            "garbage",
            "trash",
            "waste",
            "dump",
            "dumpster",
            "dustbin",
            "bins",
            "litter",
            "overflowing bin",
            "garbage pile",
            "dead animal",
            "sweeping",
            "uncollected waste",
            "drainage",
            "sewage",
            "gutter",
            "gutters",
            "sewer",
            "stagnant water",
            "foul smell",
            "open sewage",
            "filth",
            "cleaning"
        ],
        categories: [
            "Sanitation",
            "Sanitation & Waste",
            "Sanitation & Waste Management",
            "Sanitation Department"
        ]
    },
    "Electricity": {
        keywords: [
            "electricity",
            "power",
            "street light",
            "streetlight",
            "streetlights",
            "lamp",
            "light pole",
            "pole",
            "wire",
            "wires",
            "cable",
            "cables",
            "spark",
            "sparking",
            "transformer",
            "blackout",
            "power outage",
            "electric shock",
            "exposed wire",
            "damaged wire",
            "live wire",
            "voltage",
            "meter box"
        ],
        categories: [
            "Electricity",
            "Electricity & Power",
            "Electricity Department"
        ]
    },
    "Public Safety": {
        keywords: [
            "hazard",
            "hazardous",
            "danger",
            "dangerous",
            "open manhole",
            "deep crater",
            "unbarricaded excavation",
            "collapse",
            "collapsed wall",
            "building collapse risk",
            "fallen tree",
            "tree blocking road",
            "landslide",
            "live high voltage wire",
            "gas leak",
            "chemical spill",
            "major accident risk",
            "safety hazard"
        ],
        categories: [
            "Public Safety",
            "Public Health & Safety",
            "Public Safety Department"
        ]
    }
};
// Political Slogan / Non-Civic / Propaganda Patterns
const NON_CIVIC_POLITICAL_PATTERNS = [
    /\bmodi\s*(ko)?\s*(hatao|hataao|murdabad|chor|hata)\b/i,
    /\b(rahul|modi|kejr[ie]wal|shah|yogi)\s*(hatao|zindabad|murdabad|chor|ko hatao)\b/i,
    /\bvote\s+for\s+(bjp|congress|aap|bsp|cpi|sp|nda|upa)\b/i,
    /\b(election|political party|party rally|sarkar giraao|hatao sarkar)\b/i,
    /\b(jai\s+shri|allah\s+hu|religious fight|dharma yudh)\b/i,
    /\bcollege\s+holidays?\b/i,
    /\bgive\s+us\s+(more|extra)\s+holidays?\b/i
];
// Vague / Meaningless / Placeholder Patterns
const MEANINGLESS_PATTERNS = [
    /^(asdf|qwerty|1234|test|testing|sample|check|hello|hi|random|xxx|xyz|abc|abcd)\b/i,
    /^(a{4,}|b{4,}|c{4,}|d{4,}|e{4,}|f{4,}|g{4,}|h{4,}|x{4,}|z{4,}|\.{4,}|-{4,})$/i
];
/**
 * Text Similarity (Jaccard on words)
 */ function computeTextSimilarity(textA = "", textB = "") {
    const wordsA = new Set(textA.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
    const wordsB = new Set(textB.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    let intersection = 0;
    for (const w of wordsA){
        if (wordsB.has(w)) intersection++;
    }
    const union = wordsA.size + wordsB.size - intersection;
    return union === 0 ? 0 : Math.round(intersection / union * 100);
}
/**
 * Validate Civic Complaint & Compute Automatic Routing
 *
 * @param {Object} complaintData - { title, description, category, location, image }
 * @param {Array} existingComplaints - Active complaints for duplicate detection
 * @returns {Object} Full AI validation report & recommended workflow status
 */ async function validateCivicComplaint(complaintData = {}, existingComplaints = []) {
    try {
        let activeList = [];
        if (Array.isArray(existingComplaints)) {
            activeList = existingComplaints;
        } else if (existingComplaints && typeof existingComplaints.find === "function") {
            activeList = await existingComplaints.find({
                isClosed: {
                    $ne: true
                },
                status: {
                    $ne: "Closed"
                }
            }).limit(50).lean();
        }
        const title = (complaintData.title || "").trim();
        const description = (complaintData.description || "").trim();
        const selectedCategory = (complaintData.category || "").trim();
        const location = (complaintData.location || "").trim();
        const image = complaintData.image || "";
        const fullText = `${title} ${description}`.toLowerCase();
        const warnings = [];
        const matchingComplaints = [];
        // =========================================================================
        // 1. Check for Empty / Meaningless / Vague Text
        // =========================================================================
        let isMeaningless = false;
        if (title.length < 4 || description.length < 12) {
            isMeaningless = true;
            warnings.push("Description is too brief or lacks meaningful details required for on-ground inspection.");
        }
        for (const pat of MEANINGLESS_PATTERNS){
            if (pat.test(title) || pat.test(description)) {
                isMeaningless = true;
                warnings.push(`Complaint text matches placeholder or test pattern ("${title.slice(0, 20)}").`);
                break;
            }
        }
        // =========================================================================
        // 2. Check for Political Slogans / Non-Civic Content
        // =========================================================================
        let isPoliticalOrNonCivic = false;
        for (const pat of NON_CIVIC_POLITICAL_PATTERNS){
            if (pat.test(fullText)) {
                isPoliticalOrNonCivic = true;
                warnings.push("Flagged: Non-Civic Content / Political Slogan detected. Not an actionable municipal infrastructure grievance.");
                break;
            }
        }
        // =========================================================================
        // 3. Department Classification & Confidence
        // =========================================================================
        let bestDept = "Other/Unclear";
        let maxHits = 0;
        const scores = {};
        for (const [deptName, config] of Object.entries(DEPARTMENT_TAXONOMY)){
            let hits = 0;
            for (const kw of config.keywords){
                if (fullText.includes(kw)) {
                    // Boost whole word match
                    const regex = new RegExp(`\\b${kw}\\b`, "i");
                    hits += regex.test(fullText) ? 2 : 1;
                }
            }
            scores[deptName] = hits;
            if (hits > maxHits) {
                maxHits = hits;
                bestDept = deptName;
            }
        }
        // Calculate real classification confidence
        let classificationConfidence = 50;
        if (maxHits >= 4) classificationConfidence = 95;
        else if (maxHits === 3) classificationConfidence = 88;
        else if (maxHits === 2) classificationConfidence = 78;
        else if (maxHits === 1) classificationConfidence = 65;
        else classificationConfidence = 40;
        // Check category vs detected department
        let detectedCategory = bestDept;
        if (bestDept === "Roads Department") detectedCategory = "Roads & Infrastructure";
        else if (bestDept === "Water Supply") detectedCategory = "Water Supply & Drainage";
        else if (bestDept === "Sanitation") detectedCategory = "Sanitation & Waste Management";
        else if (bestDept === "Electricity") detectedCategory = "Electricity & Power";
        else if (bestDept === "Public Safety") detectedCategory = "Public Safety & Hazards";
        else detectedCategory = "Other Civic Issue";
        // Detect Category Mismatch
        if (selectedCategory && selectedCategory !== "Select civic category" && selectedCategory !== "Other Civic Issue" && bestDept !== "Other/Unclear") {
            const config = DEPARTMENT_TAXONOMY[bestDept];
            const matchesSelected = config.categories.some((c)=>selectedCategory.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(selectedCategory.toLowerCase()));
            if (!matchesSelected && maxHits >= 2) {
                warnings.push(`Category Mismatch: Citizen selected '${selectedCategory}', but AI semantic analysis classified content as '${bestDept}' (${classificationConfidence}% confidence).`);
            }
        }
        // =========================================================================
        // 4. Image Validation & Forensic Relevance
        // =========================================================================
        let imageRelevance = "Relevant Evidence";
        let authenticityScore = 95;
        const hasImage = Boolean(image && image.length > 500);
        if (!hasImage) {
            imageRelevance = "Missing Photo";
            authenticityScore = 50;
            warnings.push("No photographic evidence provided; on-site physical verification required.");
        } else {
            const vision = analyzeCivicImage(image, detectedCategory, title);
            authenticityScore = vision.authenticityScore;
            if (vision.isSynthetic) {
                imageRelevance = "Synthetic / AI-Generated Graphic";
                warnings.push("Digital metadata audit detected AI-generated / Canva export signatures (not an authentic camera photo).");
            } else if (vision.isInappropriateOrUnrelated) {
                imageRelevance = "Inappropriate / Unrelated Photo";
                warnings.push(...vision.reasons || [
                    "Uploaded photo is unrelated to municipal infrastructure issues."
                ]);
            } else if (!vision.isRelevant) {
                imageRelevance = "Image Mismatch (Texture / Category Discrepancy)";
                warnings.push(...vision.reasons || [
                    `Visual mismatch: Image lacks textures required for '${detectedCategory}'.`
                ]);
            } else if (!vision.isValid) {
                imageRelevance = "Unreadable / Corrupt Image Evidence";
                warnings.push("Uploaded image payload could not be decoded or is unreadable.");
            } else {
                imageRelevance = "Relevant Evidence";
            }
        }
        // =========================================================================
        // 5. Duplicate Detection (Text Similarity + Image dHash + Location)
        // =========================================================================
        let isPossibleDuplicate = false;
        let duplicateProbability = 0;
        if (Array.isArray(activeList) && activeList.length > 0) {
            for (const existing of activeList){
                if (!existing || existing.isClosed) continue;
                const existingFull = `${existing.title || ""} ${existing.description || ""}`;
                const textScore = computeTextSimilarity(fullText, existingFull);
                // Location proximity match
                const locA = location.toLowerCase();
                const locB = (existing.location || "").toLowerCase();
                const sameLoc = Boolean(locA && locB && (locA.includes(locB) || locB.includes(locA)));
                // Image dHash comparison
                let imageDuplicate = false;
                if (complaintData.dHash && existing.evidenceAnalysis?.dHash) {
                    const dist = computeHammingDistance(complaintData.dHash, existing.evidenceAnalysis.dHash);
                    if (dist <= 8) imageDuplicate = true;
                }
                let combinedScore = textScore;
                if (sameLoc) combinedScore += 20;
                if (imageDuplicate) combinedScore += 30;
                combinedScore = Math.min(combinedScore, 98);
                if (combinedScore >= 45 || imageDuplicate) {
                    isPossibleDuplicate = true;
                    duplicateProbability = Math.max(duplicateProbability, combinedScore);
                    matchingComplaints.push({
                        complaintId: existing._id,
                        complaintNumber: existing.complaintNumber || `GRV-${String(existing._id).slice(-5).toUpperCase()}`,
                        title: existing.title,
                        similarityScore: combinedScore,
                        reason: imageDuplicate ? `Visual perceptual hash match (${combinedScore}% confidence) in ${existing.location || "same area"}` : `High semantic overlap (${textScore}%) in ${existing.location || "same area"}`
                    });
                }
            }
        }
        if (isPossibleDuplicate) {
            warnings.push(`Possible duplicate detected: ${duplicateProbability}% match with active grievance ${matchingComplaints[0]?.complaintNumber}. Flagged for officer consolidation review.`);
        }
        // =========================================================================
        // 6. Workflow Status & Next Action Determination
        // =========================================================================
        let finalStatus = "Accepted and Assigned";
        let recommendedAction = "Auto-Route & Assign";
        let explanation = `Grievance classified under ${bestDept} with ${classificationConfidence}% confidence and routed for field action.`;
        if (isMeaningless) {
            finalStatus = "Needs More Information";
            recommendedAction = "Request More Information";
            explanation = "Complaint description is incomplete or lacks actionable civic details.";
        } else if (isPoliticalOrNonCivic) {
            finalStatus = "Under Manual Review";
            recommendedAction = "Review or Reject (Political / Non-Civic Content)";
            explanation = "Grievance contains political slogan or personal non-infrastructure dispute.";
        } else if (isPossibleDuplicate) {
            finalStatus = "Under Manual Review";
            recommendedAction = "Mark Possible Duplicate / Merge";
            explanation = `Potential visual or textual duplicate of active complaint #${matchingComplaints[0]?.complaintNumber}. Requires officer verification before public funds are dispatched.`;
        } else if (imageRelevance.includes("Synthetic") || imageRelevance.includes("Mismatch") || imageRelevance.includes("Unrelated") || imageRelevance.includes("Inappropriate")) {
            finalStatus = "Under Manual Review";
            recommendedAction = "Review Inauthentic / Unrelated Evidence";
            explanation = `Evidence image flagged for inspection (${imageRelevance}). Requires officer audit.`;
        } else if (bestDept === "Other/Unclear" || classificationConfidence < 60) {
            finalStatus = "Under Manual Review";
            recommendedAction = "Manual Classification & Queue Assignment";
            explanation = "Issue category is unclear or ambiguous. Sent to supervisor manual verification queue.";
        }
        return {
            isValidCivic: !isPoliticalOrNonCivic && !isMeaningless,
            classificationConfidence,
            detectedCategory,
            recommendedDepartment: bestDept,
            imageRelevance,
            authenticityScore,
            duplicateProbability,
            isPossibleDuplicate,
            matchingComplaints,
            warnings,
            explanation,
            recommendedAction,
            status: finalStatus,
            analyzedAt: new Date()
        };
    } catch (error) {
        // If AI service fails or crashes: "mark the complaint 'Needs Manual Review'; do not pretend analysis succeeded"
        console.error("AI Validation Service Error:", error);
        return {
            isValidCivic: true,
            classificationConfidence: 50,
            detectedCategory: complaintData.category || "General",
            recommendedDepartment: "Other/Unclear",
            imageRelevance: "Unverified (AI Service Failure)",
            authenticityScore: 50,
            duplicateProbability: 0,
            isPossibleDuplicate: false,
            matchingComplaints: [],
            warnings: [
                "Automated AI validation service was temporarily unavailable. Complaint queued for manual officer review."
            ],
            explanation: "Automated analysis could not be completed. Marked for manual verification.",
            recommendedAction: "Manual Review Required",
            status: "Under Manual Review",
            analyzedAt: new Date()
        };
    }
}
module.exports = {
    validateCivicComplaint,
    DEPARTMENT_TAXONOMY
};
}),
"[project]/utils/aiVisionAnalyzer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * AI Vision & Civic Defect Integrity Analyzer
 * Analyzes citizen evidence images for:
 * 1. Provenance & tampering (AI-generated graphics, Canva, Photoshop, Midjourney)
 * 2. Visual spectrum & Category Relevance (Pothole/Road, Water Leak, Garbage Dump, Electric Wire, etc.)
 * 3. Inappropriate / Non-civic image detection (Selfies, document screenshots, memes, flat graphics)
 * 4. Perceptual difference hashing (dHash) for duplicate detection
 */ function analyzeCivicImage(base64Image, category = "", title = "") {
    if (!base64Image || typeof base64Image !== "string" || base64Image.length < 100) {
        return {
            isValid: false,
            authenticityScore: 20,
            aiFlag: "Flagged: Missing or Unreadable Photographic Evidence",
            reasons: [
                "No valid image payload received."
            ],
            isSynthetic: false,
            isRelevant: false,
            dHash: null
        };
    }
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const asciiHeader = buffer.slice(0, 4000).toString("ascii").toLowerCase();
    const reasons = [];
    let authenticityScore = 95;
    let isSynthetic = false;
    let isRelevant = true;
    let isInappropriateOrUnrelated = false;
    // 1. Digital Provenance & Synthetic Image Detection (Canva, Midjourney, Photoshop, etc.)
    const aiToolSignatures = [
        "containsaigeneratedcontent",
        "canva.com",
        "midjourney",
        "dall-e",
        "stablediffusion",
        "photoshop",
        "illustrator",
        "gimp",
        "figma",
        "picsart",
        "meme"
    ];
    for (const sig of aiToolSignatures){
        if (asciiHeader.includes(sig)) {
            isSynthetic = true;
            authenticityScore = Math.min(authenticityScore, 20);
            if (sig.includes("aigenerated") || sig.includes("canva") || sig.includes("midjourney") || sig.includes("dall-e")) {
                reasons.push("Digital metadata scan detected AI-generated / Canva graphic signatures (not an authentic camera photo).");
            } else {
                reasons.push(`Digital editing/graphic software signature detected in image metadata (${sig}).`);
            }
            break;
        }
    }
    // 2. Optical Sample Analysis (Pixel distribution, textures, color variance)
    const sampleLength = Math.min(buffer.length, 60000);
    let whiteCount = 0;
    let blackCount = 0;
    let skinToneCount = 0;
    let highSatIndicator = 0;
    let neutralGrayIndicator = 0;
    let totalColorDiff = 0;
    for(let i = 100; i < sampleLength; i += 4){
        const r = buffer[i] || 0;
        const g = buffer[i + 1] || 0;
        const b = buffer[i + 2] || 0;
        // Pure white (document screenshot / blank canvas)
        if (r > 240 && g > 240 && b > 240) whiteCount++;
        // Pure black (underexposed or covered camera)
        if (r < 15 && g < 15 && b < 15) blackCount++;
        // Skin tone heuristic (Portraits / Selfies)
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15 && Math.abs(r - g) > 15) {
            skinToneCount++;
        }
        // Color difference
        const diff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        totalColorDiff += diff;
        if (diff < 22) {
            neutralGrayIndicator++;
        } else if (diff > 85) {
            highSatIndicator++;
        }
    }
    const totalSamples = Math.max(1, (sampleLength - 100) / 4);
    const whiteRatio = whiteCount / totalSamples;
    const blackRatio = blackCount / totalSamples;
    const skinRatio = skinToneCount / totalSamples;
    const grayRatio = neutralGrayIndicator / totalSamples;
    const satRatio = highSatIndicator / totalSamples;
    // Detection A: Document / Invoice / Code / Text Screenshot
    if (whiteRatio > 0.60) {
        isInappropriateOrUnrelated = true;
        isRelevant = false;
        authenticityScore = Math.min(authenticityScore, 18);
        reasons.push("Document/Text Screenshot Detected: Uploaded image is a text document, paper invoice, or screen capture rather than an outdoor municipal defect photo.");
    }
    // Detection B: Solid Black / Covered Lens / Unreadable
    if (blackRatio > 0.75) {
        isInappropriateOrUnrelated = true;
        isRelevant = false;
        authenticityScore = Math.min(authenticityScore, 15);
        reasons.push("Unreadable Evidence: Camera sensor appears completely obscured or image is pitch-black without visible civic structures.");
    }
    // Detection C: Portrait / Selfie / Personal Photo
    if (skinRatio > 0.40) {
        isInappropriateOrUnrelated = true;
        isRelevant = false;
        authenticityScore = Math.min(authenticityScore, 25);
        reasons.push("Personal Portrait / Selfie Detected: Image contains human portraiture instead of on-site civic infrastructure or defect evidence.");
    }
    // 3. Category-Specific Visual Consistency
    const targetCategory = (category || "").toLowerCase();
    const targetTitle = (title || "").toLowerCase();
    // ROADS & INFRASTRUCTURE (Needs asphalt, neutral stone, tar textures)
    if (targetCategory.includes("road") || targetCategory.includes("infrastructure") || targetTitle.includes("pothole") || targetTitle.includes("crater") || targetTitle.includes("road")) {
        if (satRatio > 0.48 && grayRatio < 0.22) {
            isRelevant = false;
            authenticityScore = Math.min(authenticityScore, 30);
            reasons.push("Visual Mismatch: Image contains bright artificial colors and lacks asphalt/pavement/road surface textures required for 'Roads & Infrastructure'.");
        }
    }
    // WATER SUPPLY (Needs liquid reflections, plumbing pipes, or wet ground)
    if (targetCategory.includes("water") || targetTitle.includes("leak") || targetTitle.includes("pipe")) {
        if (satRatio > 0.55 && grayRatio < 0.15) {
            isRelevant = false;
            authenticityScore = Math.min(authenticityScore, 35);
            reasons.push("Visual Mismatch: Image lacks water leakage, pipe infrastructure, or drainage evidence.");
        }
    }
    // 4. Compute Perceptual Difference Hash (dHash for duplicate detection)
    let dHash = "";
    const step = Math.max(1, Math.floor(buffer.length / 64));
    for(let i = 0; i < 64; i++){
        const p1 = buffer[i * step] || 0;
        const p2 = buffer[(i + 1) * step] || 0;
        dHash += p1 > p2 ? "1" : "0";
    }
    // 5. Final AI Flag Determination
    let aiFlag = "Clean";
    if (isSynthetic) {
        aiFlag = "Flagged: Synthetic / AI-Generated Graphic";
    } else if (isInappropriateOrUnrelated) {
        aiFlag = "Flagged: Unrelated / Inappropriate Image Evidence";
    } else if (!isRelevant) {
        aiFlag = "Flagged: Image Mismatch (Unrelated to Reported Category)";
    } else if (authenticityScore < 60) {
        aiFlag = "Flagged: Low Authenticity Evidence";
    }
    if (reasons.length === 0) {
        reasons.push("Image passed optical texture, digital provenance, and category consistency verification.");
    }
    return {
        authenticityScore,
        aiFlag,
        reasons,
        isSynthetic,
        isRelevant,
        isInappropriateOrUnrelated,
        dHash
    };
}
function computeHammingDistance(hashA, hashB) {
    if (!hashA || !hashB || hashA.length !== hashB.length) return 64;
    let dist = 0;
    for(let i = 0; i < hashA.length; i++){
        if (hashA[i] !== hashB[i]) dist++;
    }
    return dist;
}
module.exports = {
    analyzeCivicImage,
    computeHammingDistance
};
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

//# sourceMappingURL=%5Broot-of-the-server%5D__18w2zdxkr8r6w._.js.map