const { runHandler } = require("../../../../../lib/nextAdapter");
const { provideMoreInfo } = require("../../../../../controllers/complaintController");

export async function POST(request, context) {
  return runHandler(provideMoreInfo, request, context, { protect: true, role: "client" });
}
