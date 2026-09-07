import { auth } from "@/auth";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  });
}
