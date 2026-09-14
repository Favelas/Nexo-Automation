import { test, expect, type APIRequestContext } from "@playwright/test";

const password = process.env.TEST_USER_PASSWORD ?? "Password123!";

async function login(request: APIRequestContext, email: string) {
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

test("Anonymous GET /api/requests is 401", async ({ request }) => {
  const response = await request.get("/api/requests");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});

test("GET /api/auth/me as customer A returns CUSTOMER", async ({ request }) => {
  await login(request, "customer.a@nexo.test");
  const response = await request.get("/api/auth/me");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.email).toBe("customer.a@nexo.test");
  expect(body.role).toBe("CUSTOMER");
});

test("Customer A list is own rows only; NX-000003 is 404", async ({
  request,
}) => {
  await login(request, "customer.a@nexo.test");

  const listResponse = await request.get("/api/requests");
  expect(listResponse.status()).toBe(200);
  const list = (await listResponse.json()) as Array<{ publicId: string }>;
  const ids = list.map((row) => row.publicId);
  expect(ids).toContain("NX-000001");
  expect(ids).toContain("NX-000002");
  expect(ids).not.toContain("NX-000003");

  const hidden = await request.get("/api/requests/NX-000003");
  expect(hidden.status()).toBe(404);
  const body = await hidden.json();
  expect(body.error.code).toBe("NOT_FOUND");
});

test("Agent can GET NX-000003 and cannot POST a request", async ({
  request,
}) => {
  await login(request, "agent@nexo.test");

  const detail = await request.get("/api/requests/NX-000003");
  expect(detail.status()).toBe(200);
  const row = await detail.json();
  expect(row.publicId).toBe("NX-000003");

  const create = await request.post("/api/requests", {
    data: {
      title: "Agent must not create",
      categoryId: "not-a-uuid",
      description: "RBAC",
    },
  });
  expect(create.status()).toBe(403);
  const body = await create.json();
  expect(body.error.code).toBe("FORBIDDEN");
});

test("Customer A cannot PATCH status", async ({ request }) => {
  await login(request, "customer.a@nexo.test");
  const response = await request.patch("/api/requests/NX-000001", {
    data: { status: "IN_PROGRESS" },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error.code).toBe("FORBIDDEN");
});
