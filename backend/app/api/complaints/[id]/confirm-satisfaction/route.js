const { runHandler } = require("../../../../../lib/nextAdapter");
const { confirmSatisfaction } = require("../../../../../controllers/complaintController");

export async function POST(request, context) {
  return runHandler(confirmSatisfaction, request, context, { protect: true, role: "client" });
}
