const { runHandler } = require("../../../lib/nextAdapter");
const { submitComplaint } = require("../../../controllers/complaintController");

export async function POST(request, context) {
  return runHandler(submitComplaint, request, context, { protect: true, role: "client" });
}
