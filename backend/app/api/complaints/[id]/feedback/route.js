const { runHandler } = require("../../../../../lib/nextAdapter");
const { submitFeedback } = require("../../../../../controllers/complaintController");

export async function POST(request, context) {
  return runHandler(submitFeedback, request, context, { protect: true, role: "client" });
}
