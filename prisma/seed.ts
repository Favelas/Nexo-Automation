import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedUsers = [
  {
    email: "customer.a@nexo.test",
    name: "Ana Rivera",
    role: RoleName.CUSTOMER,
  },
  {
    email: "customer.b@nexo.test",
    name: "Ben Cho",
    role: RoleName.CUSTOMER,
  },
  {
    email: "agent@nexo.test",
    name: "Avery Cole",
    role: RoleName.AGENT,
  },
] as const;

async function main() {
  const password = process.env.TEST_USER_PASSWORD ?? "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const roles = await Promise.all(
    [RoleName.CUSTOMER, RoleName.AGENT].map((name) =>
      prisma.role.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    ),
  );

  const roleId = Object.fromEntries(roles.map((role) => [role.name, role.id]));

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        roleId: roleId[user.role],
      },
      update: {
        name: user.name,
        passwordHash,
        roleId: roleId[user.role],
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
