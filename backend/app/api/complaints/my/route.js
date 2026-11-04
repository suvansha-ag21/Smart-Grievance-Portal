const { runHandler } = require("../../../../lib/nextAdapter");
const { getMyComplaints } = require("../../../../controllers/complaintController");

export async function GET(request, context) {
  return runHandler(getMyComplaints, request, context, { protect: true, role: "client" });
}
