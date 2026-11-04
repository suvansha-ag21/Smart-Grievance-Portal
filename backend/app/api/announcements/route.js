const { runHandler } = require("../../../lib/nextAdapter");
const { getAnnouncements, createAnnouncement } = require("../../../controllers/announcementController");

export async function GET(request, context) {
  return runHandler(getAnnouncements, request, context);
}

export async function POST(request, context) {
  return runHandler(createAnnouncement, request, context, { protect: true, role: "admin" });
}
