const { runHandler } = require("../../../../lib/nextAdapter");
const { adminDashboard } = require("../../../../controllers/dashboardController");

export async function GET(request, context) {
  return runHandler(adminDashboard, request, context, { protect: true, role: "admin" });
}
