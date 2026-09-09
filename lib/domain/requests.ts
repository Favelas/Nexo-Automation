import type { SessionUser } from "@/lib/auth/session";
import { DomainError, ValidationError } from "@/lib/domain/errors";
import { prisma } from "@/lib/prisma";
import type { Request, RequestStatus } from "@prisma/client";

export type RequestRecord = Request & {
  category: { id: string; name: string; slug: string };
};

const requestInclude = {
  category: { select: { id: true, name: true, slug: true } },
} as const;

export function statusLabel(status: RequestStatus) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
  }
}

function isOwn(request: Request, user: SessionUser) {
  return request.customerId === user.id;
}

export async function listVisibleRequests(
  user: SessionUser,
): Promise<RequestRecord[]> {
  return prisma.request.findMany({
    where: user.role === "CUSTOMER" ? { customerId: user.id } : undefined,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getVisibleRequest(
  user: SessionUser,
  publicId: string,
): Promise<RequestRecord | null> {
  const request = await prisma.request.findUnique({
    where: { publicId },
    include: requestInclude,
  });

  if (!request) {
    return null;
  }

  if (user.role === "CUSTOMER" && !isOwn(request, user)) {
    return null;
  }

  return request;
}

export async function createCustomerRequest(
  user: SessionUser,
  input: { title: string; description: string; categoryId: string },
): Promise<RequestRecord> {
  if (user.role !== "CUSTOMER") {
    throw new DomainError(403, "FORBIDDEN", "Agents cannot create a request.");
  }

  const title = input.title.trim();
  const description = input.description.trim();
  const categoryId = input.categoryId.trim();
  const fields: Record<string, string> = {};

  if (!title) {
    fields.title = "Title is required.";
  }
  if (!categoryId) {
    fields.category = "Category is required.";
  }
  if (!description) {
    fields.description = "Description is required.";
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError(fields);
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new ValidationError({ category: "Category is required." });
  }

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ public_id: string }>>`
      SELECT next_request_public_id() AS public_id
    `;
    const publicId = rows[0]?.public_id;
    if (!publicId) {
      throw new Error("Could not allocate a public id.");
    }

    const request = await tx.request.create({
      data: {
        publicId,
        title,
        description,
        status: "SUBMITTED",
        customerId: user.id,
        categoryId: category.id,
      },
      include: requestInclude,
    });

    await tx.requestStatusHistory.create({
      data: {
        requestId: request.id,
        fromStatus: null,
        toStatus: "SUBMITTED",
        actorId: user.id,
      },
    });

    return request;
  });
}

export function toRequestJson(request: RequestRecord) {
  return {
    publicId: request.publicId,
    title: request.title,
    description: request.description,
    status: request.status,
    category: request.category,
    createdAt: request.createdAt.toISOString(),
  };
}
