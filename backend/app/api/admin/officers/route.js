const { runHandler } = require("../../../../lib/nextAdapter");
const { createOfficer } = require("../../../../controllers/adminController");

export async function POST(request, context) {
  return runHandler(createOfficer, request, context, { protect: true, role: "admin" });
}
