const { runHandler } = require("../../../../lib/nextAdapter");
const { getAssignedComplaints } = require("../../../../controllers/officerController");

export async function GET(request, context) {
  return runHandler(getAssignedComplaints, request, context, { protect: true, role: "officer" });
}
