const { runHandler } = require("../../../../lib/nextAdapter");
const { getAllComplaints } = require("../../../../controllers/adminController");

export async function GET(request, context) {
  return runHandler(getAllComplaints, request, context, { protect: true, role: "admin" });
}
