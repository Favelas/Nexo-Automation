import type { RoleName } from "@prisma/client";

export const INVALID_LOGIN_MESSAGE = "Invalid email or password.";

export function dashboardPath(role: RoleName) {
  return role === "AGENT" ? "/agent/dashboard" : "/customer/dashboard";
}
