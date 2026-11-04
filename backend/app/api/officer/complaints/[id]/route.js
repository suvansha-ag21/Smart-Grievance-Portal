const { runHandler } = require("../../../../../lib/nextAdapter");
const { updateComplaintStatus } = require("../../../../../controllers/officerController");

export async function PUT(request, context) {
  return runHandler(updateComplaintStatus, request, context, { protect: true, role: "officer" });
}
