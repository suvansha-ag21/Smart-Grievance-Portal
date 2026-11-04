const { runHandler } = require("../../../../lib/nextAdapter");
const { officerDashboard } = require("../../../../controllers/dashboardController");

export async function GET(request, context) {
  return runHandler(officerDashboard, request, context, { protect: true, role: "officer" });
}
