const { runHandler } = require("../../../lib/nextAdapter");
const { getDepartments, createDepartment } = require("../../../controllers/departmentController");

export async function GET(request, context) {
  return runHandler(getDepartments, request, context);
}

export async function POST(request, context) {
  return runHandler(createDepartment, request, context, { protect: true });
}
