const { runHandler } = require("../../../../lib/nextAdapter");
const { registerUser } = require("../../../../controllers/authController");

export async function POST(request, context) {
  return runHandler(registerUser, request, context);
}
