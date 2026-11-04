const { runHandler } = require("../../../../lib/nextAdapter");
const { changePassword } = require("../../../../controllers/authController");

export async function PUT(request, context) {
  return runHandler(changePassword, request, context, { protect: true });
}
