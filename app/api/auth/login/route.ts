import { signIn } from "@/auth";
import { INVALID_LOGIN_MESSAGE } from "@/lib/auth/dashboard-path";
import { verifyCredentials } from "@/lib/auth/verify-credentials";
import { jsonError } from "@/lib/http";
import { AuthError } from "next-auth";
import { NextResponse } from "next/server";

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).includes("NEXT_REDIRECT")
  );
}

export async function POST(request: Request) {
  let email = "";
  let password = "";

  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return jsonError(400, "VALIDATION_ERROR", INVALID_LOGIN_MESSAGE);
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", INVALID_LOGIN_MESSAGE);
  }

  try {
    await signIn("credentials", {
      email: user.email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (isNextRedirect(error)) {
      // Auth.js may throw a redirect after a successful sign-in.
    } else if (error instanceof AuthError) {
      return jsonError(401, "UNAUTHORIZED", INVALID_LOGIN_MESSAGE);
    } else {
      throw error;
    }
  }

  return NextResponse.json(user);
}
