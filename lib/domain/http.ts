import { DomainError, ValidationError } from "@/lib/domain/errors";
import { jsonError } from "@/lib/http";
import { NextResponse } from "next/server";

export function domainErrorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof DomainError) {
    return jsonError(error.httpStatus, error.code, error.message);
  }

  throw error;
}
