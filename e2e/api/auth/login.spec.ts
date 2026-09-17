import { test, expect, type APIRequestContext } from "@playwright/test";

// Igual que Postman: method + path + body. No hay { page } ni clicks.
const password = process.env.TEST_USER_PASSWORD ?? "Password123!";

async function login(request: APIRequestContext, email: string, pass = password) {
  return request.post("/api/auth/login", {
    data: { email, password: pass },
  });
}

test("Anonymous GET /api/auth/me is 401", async ({ request }) => {
  const response = await request.get("/api/auth/me");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});

test("Valid customer login then GET /api/auth/me is CUSTOMER", async ({
  request,
}) => {
  const loginResponse = await login(request, "customer.a@nexo.test");
  expect(loginResponse.status()).toBe(200);

  // La cookie de sesión queda en { request } (como el cookie jar de Postman).
  const me = await request.get("/api/auth/me");
  expect(me.status()).toBe(200);
  const body = await me.json();
  expect(body.email).toBe("customer.a@nexo.test");
  expect(body.role).toBe("CUSTOMER");
});

test("Invalid password on POST /api/auth/login is 401", async ({ request }) => {
  const response = await login(
    request,
    "customer.a@nexo.test",
    "WrongPassword!",
  );
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
  expect(body.error.message).toBe("Invalid email or password.");
});
