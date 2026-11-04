const { runHandler } = require("../../../../lib/nextAdapter");
const { updateDepartment, deleteDepartment } = require("../../../../controllers/departmentController");

export async function PUT(request, context) {
  return runHandler(updateDepartment, request, context, { protect: true });
}

export async function DELETE(request, context) {
  return runHandler(deleteDepartment, request, context, { protect: true });
}
