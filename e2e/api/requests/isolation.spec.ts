import { test, expect, type APIRequestContext } from "@playwright/test";

const password = process.env.TEST_USER_PASSWORD ?? "Password123!";

async function login(request: APIRequestContext, email: string, pass = password) {
  return request.post("/api/auth/login", {
    data: { email, password: pass },
  });
}

test("Attempt to access request with no session is 401", async ({ request }) => {
  const response = await request.get("/api/requests");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});

test("Valid users access requests", async ({ request }) => {
  const loginResponse = await login(request, "customer.a@nexo.test");
  expect(loginResponse.status()).toBe(200);
  const response = await request.get("/api/requests");
  expect(response.status()).toBe(200);
  const body = await response.json();
  const ids = body.map((row: { publicId: string }) => row.publicId);
  expect(ids).toContain("NX-000001");
  expect(ids).toContain("NX-000002");
  expect(ids).not.toContain("NX-000003");
        
});

test("User A can't see requests from User B", async ({ request}) => {
  const loginResponse = await login(request, "customer.a@nexo.test");
  expect(loginResponse.status()).toBe(200);
  const response = await request.get("/api/requests/NX-000003");
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.error.code).toBe("NOT_FOUND");
});

test("Agent can access requests from any user", async ({ request}) => {
  const loginResponse = await login(request, "agent@nexo.test");
  expect(loginResponse.status()).toBe(200);
  const response = await request.get("/api/requests/NX-000003");
  expect(response.status()).toBe(200);
  const response2 = await request.get("/api/requests/NX-000001");
  expect(response.status()).toBe(200);
});

test("Agent can't add new requests", async ({ request }) => {
  const loginResponse = await login(request, "agent@nexo.test");
  expect(loginResponse.status()).toBe(200);
  const response = await request.post("/api/requests", {
    data: { categoryId: "x", title: "x", description: "x" },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error.code).toBe("FORBIDDEN");
});

test("Customer can't change request status", async ({ request }) => {
  const loginResponse = await login(request, "customer.a@nexo.test");
  expect(loginResponse.status()).toBe(200);
  const response = await request.patch("/api/requests/NX-000001", {
    data: { status: "IN_PROGRESS" },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error.code).toBe("FORBIDDEN");
});