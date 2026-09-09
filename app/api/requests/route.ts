import { getSessionUser } from "@/lib/auth/session";
import { domainErrorResponse } from "@/lib/domain/http";
import {
  createCustomerRequest,
  listVisibleRequests,
  toRequestJson,
} from "@/lib/domain/requests";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const requests = await listVisibleRequests(user);
  return NextResponse.json(requests.map(toRequestJson));
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  }

  let body: {
    categoryId?: unknown;
    title?: unknown;
    description?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Check the highlighted fields.");
  }

  try {
    const created = await createCustomerRequest(user, {
      categoryId: typeof body.categoryId === "string" ? body.categoryId : "",
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
    });
    return NextResponse.json(toRequestJson(created), { status: 201 });
  } catch (error) {
    return domainErrorResponse(error);
  }
}
