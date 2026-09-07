import { prisma } from "@/lib/prisma";
import type { RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
};

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: { role: true },
  });

  if (!user) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
  };
}
