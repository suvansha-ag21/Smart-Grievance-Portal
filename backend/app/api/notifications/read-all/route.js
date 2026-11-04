const { runHandler } = require("../../../../lib/nextAdapter");
const { markAllAsRead } = require("../../../../controllers/notificationController");

export async function PUT(request, context) {
  return runHandler(markAllAsRead, request, context, { protect: true });
}
