const { runHandler } = require("../../../../lib/nextAdapter");
const { getAllUsers } = require("../../../../controllers/adminController");

export async function GET(request, context) {
  return runHandler(getAllUsers, request, context, { protect: true, role: "admin" });
}
