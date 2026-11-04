const { runHandler } = require("../../../../../lib/nextAdapter");
const { markAsRead } = require("../../../../../controllers/notificationController");

export async function PUT(request, context) {
  return runHandler(markAsRead, request, context, { protect: true });
}
