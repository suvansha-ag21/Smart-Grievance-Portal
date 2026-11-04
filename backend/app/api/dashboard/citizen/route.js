const { runHandler } = require("../../../../lib/nextAdapter");
const { citizenDashboard } = require("../../../../controllers/dashboardController");

export async function GET(request, context) {
  return runHandler(citizenDashboard, request, context, { protect: true, role: "client" });
}
