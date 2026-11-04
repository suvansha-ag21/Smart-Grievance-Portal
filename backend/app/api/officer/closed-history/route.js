const { runHandler } = require("../../../../lib/nextAdapter");
const { getClosedHistory } = require("../../../../controllers/officerController");

export async function GET(request, context) {
  return runHandler(getClosedHistory, request, context, { protect: true, role: "officer" });
}
