const { runHandler } = require("../../../../../lib/nextAdapter");
const { updateAnnouncement, deleteAnnouncement } = require("../../../../../controllers/adminController");

export async function PUT(request, context) {
  return runHandler(updateAnnouncement, request, context, { protect: true, role: "admin" });
}

export async function DELETE(request, context) {
  return runHandler(deleteAnnouncement, request, context, { protect: true, role: "admin" });
}
