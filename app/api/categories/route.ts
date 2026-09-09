import { getSessionUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/domain/categories";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const categories = await listCategories();
  return NextResponse.json(categories);
}
