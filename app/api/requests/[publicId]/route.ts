import { getSessionUser } from "@/lib/auth/session";
import { domainErrorResponse } from "@/lib/domain/http";
import {
  getVisibleRequest,
  toRequestJson,
  updateRequestStatus,
} from "@/lib/domain/requests";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const { publicId } = await context.params;
  let body: { status?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Status is not valid.");
  }

  try {
    const updated = await updateRequestStatus(
      user,
      publicId,
      typeof body.status === "string" ? body.status : "",
    );
    return NextResponse.json(toRequestJson(updated));
  } catch (error) {
    return domainErrorResponse(error);
  }
}
