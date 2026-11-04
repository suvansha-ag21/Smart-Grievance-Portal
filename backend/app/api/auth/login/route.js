const { runHandler } = require("../../../../lib/nextAdapter");
const { loginUser } = require("../../../../controllers/authController");

export async function POST(request, context) {
  return runHandler(loginUser, request, context);
}
