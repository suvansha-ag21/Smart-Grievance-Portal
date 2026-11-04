const { runHandler } = require("../../../../lib/nextAdapter");
const { getComplaintById, deleteComplaint } = require("../../../../controllers/complaintController");

export async function GET(request, context) {
  return runHandler(getComplaintById, request, context, { protect: true, role: "client" });
}

export async function DELETE(request, context) {
  return runHandler(deleteComplaint, request, context, { protect: true, role: "client" });
}
