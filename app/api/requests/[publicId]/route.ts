import { getSessionUser } from "@/lib/auth/session";
import { getVisibleRequest, toRequestJson } from "@/lib/domain/requests";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const { publicId } = await context.params;
  const request = await getVisibleRequest(user, publicId);
  if (!request) {
    return jsonError(404, "NOT_FOUND", "Request not found.");
  }

  return NextResponse.json(toRequestJson(request));
}
