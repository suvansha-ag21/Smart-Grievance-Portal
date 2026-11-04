const { runHandler } = require("../../../lib/nextAdapter");
const { getNotifications } = require("../../../controllers/notificationController");

export async function GET(request, context) {
  return runHandler(getNotifications, request, context, { protect: true });
}
