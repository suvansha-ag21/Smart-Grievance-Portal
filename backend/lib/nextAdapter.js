const { NextResponse } = require("next/server");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const User = require("../models/User");
const { getIsConnected } = require("../config/db");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

async function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { error: "Not authorized, no token provided", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
    await connectDB();

    let user = null;
    if (getIsConnected()) {
      try {
        user = await User.findById(decoded.id).select("-password");
      } catch {
        user = null;
      }
    }

    if (!user) {
      const { inMemoryUsers } = require("../controllers/authController");
      const mem = inMemoryUsers.find((u) => String(u._id) === String(decoded.id));
      if (mem) {
        user = {
          _id: mem._id,
          name: mem.name,
          email: mem.email,
          role: mem.role,
          department: mem.department,
        };
      }
    }

    if (!user) {
      return { error: "Not authorized, user not found", status: 401 };
    }

    return { user };
  } catch (err) {
    return { error: "Not authorized, invalid token", status: 401 };
  }
}

async function runHandler(handler, request, context = {}, options = {}) {
  await connectDB();

  // If OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  let user = null;
  if (options.protect) {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status, headers: corsHeaders });
    }
    user = authResult.user;

    if (options.role) {
      const userRole = (user.role || "").toLowerCase();
      if (options.role === "client" && userRole !== "client" && userRole !== "citizen") {
        return NextResponse.json({ message: "Access denied. Citizens only." }, { status: 403, headers: corsHeaders });
      }
      if (options.role === "officer" && userRole !== "officer" && userRole !== "admin") {
        return NextResponse.json({ message: "Access denied. Government Officers only." }, { status: 403, headers: corsHeaders });
      }
      if (options.role === "admin" && userRole !== "admin" && userRole !== "officer") {
        return NextResponse.json({ message: "Access denied. Admins only." }, { status: 403, headers: corsHeaders });
      }
    }
  }

  // Parse body
  let body = {};
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch {
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
    get: (name) => request.headers.get(name),
  };

  return new Promise(async (resolve) => {
    const mockRes = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        if (!headersSent) {
          headersSent = true;
          responseData = data;
          resolve(NextResponse.json(data, { status: responseStatus, headers: corsHeaders }));
        }
        return this;
      },
      send(data) {
        if (!headersSent) {
          headersSent = true;
          responseData = data;
          if (typeof data === "object") {
            resolve(NextResponse.json(data, { status: responseStatus, headers: corsHeaders }));
          } else {
            resolve(new NextResponse(data, { status: responseStatus, headers: corsHeaders }));
          }
        }
        return this;
      },
      setHeader() {
        return this;
      },
    };

    try {
      await handler(mockReq, mockRes);
    } catch (err) {
      console.error("Handler error:", err);
      if (!headersSent) {
        headersSent = true;
        resolve(NextResponse.json({ message: err.message || "Internal server error" }, { status: 500, headers: corsHeaders }));
      }
    }
  });
}

module.exports = {
  runHandler,
  corsHeaders,
  connectDB,
};
