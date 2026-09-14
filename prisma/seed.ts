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

  const categories = [
    { name: "Billing", slug: "billing" },
    { name: "Access", slug: "access" },
    { name: "Technical", slug: "technical" },
  ] as const;

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name },
    });
  }

  const ana = await prisma.user.findUniqueOrThrow({
    where: { email: "customer.a@nexo.test" },
  });
  const ben = await prisma.user.findUniqueOrThrow({
    where: { email: "customer.b@nexo.test" },
  });
  const avery = await prisma.user.findUniqueOrThrow({
    where: { email: "agent@nexo.test" },
  });
  const billing = await prisma.category.findUniqueOrThrow({
    where: { slug: "billing" },
  });
  const access = await prisma.category.findUniqueOrThrow({
    where: { slug: "access" },
  });
  const technical = await prisma.category.findUniqueOrThrow({
    where: { slug: "technical" },
  });

  const seedPublicIds = ["NX-000001", "NX-000002", "NX-000003"] as const;
  await prisma.request.deleteMany({
    where: { publicId: { in: [...seedPublicIds] } },
  });

  await prisma.request.create({
    data: {
      publicId: "NX-000001",
      title: "Cannot open invoice PDF",
      description: "Seed fixture. Ana cannot open the invoice PDF.",
      status: "SUBMITTED",
      customerId: ana.id,
      categoryId: billing.id,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: "SUBMITTED",
          actorId: ana.id,
        },
      },
    },
  });

  await prisma.request.create({
    data: {
      publicId: "NX-000002",
      title: "Portal password reset loops",
      description: "Seed fixture. Ana’s portal password reset loops.",
      status: "IN_PROGRESS",
      customerId: ana.id,
      assignedAgentId: avery.id,
      categoryId: access.id,
      statusHistory: {
        createMany: {
          data: [
            { fromStatus: null, toStatus: "SUBMITTED", actorId: ana.id },
            {
              fromStatus: "SUBMITTED",
              toStatus: "IN_PROGRESS",
              actorId: avery.id,
            },
          ],
        },
      },
    },
  });

  await prisma.request.create({
    data: {
      publicId: "NX-000003",
      title: "Access to archived tickets",
      description: "Seed fixture. Ben needs access to archived tickets.",
      status: "RESOLVED",
      customerId: ben.id,
      assignedAgentId: avery.id,
      categoryId: technical.id,
      statusHistory: {
        createMany: {
          data: [
            { fromStatus: null, toStatus: "SUBMITTED", actorId: ben.id },
            {
              fromStatus: "SUBMITTED",
              toStatus: "IN_PROGRESS",
              actorId: avery.id,
            },
            {
              fromStatus: "IN_PROGRESS",
              toStatus: "RESOLVED",
              actorId: avery.id,
            },
          ],
        },
      },
    },
  });

  await prisma.$executeRaw`
    SELECT setval(
      'request_public_id_seq',
      GREATEST(
        3,
        COALESCE(
          (SELECT MAX(CAST(SUBSTRING(public_id FROM 4) AS INTEGER)) FROM requests),
          0
        )
      )
    )
  `;
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
