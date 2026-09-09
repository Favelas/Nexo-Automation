import { auth } from "@/auth";
import type { RoleName } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || (user.role !== "CUSTOMER" && user.role !== "AGENT")) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? "",
    role: user.role,
  };
}
