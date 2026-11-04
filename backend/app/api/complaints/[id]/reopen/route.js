const { runHandler } = require("../../../../../lib/nextAdapter");
const { reopenComplaint } = require("../../../../../controllers/complaintController");

export async function POST(request, context) {
  return runHandler(reopenComplaint, request, context, { protect: true, role: "client" });
}
