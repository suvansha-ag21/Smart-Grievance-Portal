const { runHandler } = require("../../../../lib/nextAdapter");
const { assignOfficer } = require("../../../../controllers/adminController");

export async function PUT(request, context) {
  return runHandler(assignOfficer, request, context, { protect: true, role: "admin" });
}
