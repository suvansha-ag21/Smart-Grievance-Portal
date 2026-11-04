const { runHandler } = require("../../../../lib/nextAdapter");
const { getUserProfile, updateUserProfile } = require("../../../../controllers/authController");

export async function GET(request, context) {
  return runHandler(getUserProfile, request, context, { protect: true });
}

export async function PUT(request, context) {
  return runHandler(updateUserProfile, request, context, { protect: true });
}
