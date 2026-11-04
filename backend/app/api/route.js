import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Smart Grievance Next.js Backend API Running...",
    timestamp: new Date().toISOString(),
  });
}
