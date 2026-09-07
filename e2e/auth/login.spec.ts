import { test, expect } from "@playwright/test";

test("Valid customer lands in dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("customer.a@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/customer/dashboard");
    await expect(page.getByRole("heading", { name: "Customer dashboard" })).toBeVisible();
});

test("Valid agent lands in agent dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/agent/dashboard");
    await expect(page.getByRole("heading", { name: "Agent dashboard" })).toBeVisible();
});

test("Invalid user lands on login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("invalid@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByTestId("login-status")).toHaveText(
      "Invalid email or password.",
    );
});

test("Invalid password lands on login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("customer.a@nexo.test");
    await page.getByLabel("Password").fill("invalidpassword");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByTestId("login-status")).toHaveText(
      "Invalid email or password.",
    );
});

test("Authenticated customer can logout", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("customer.a@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await page.getByTestId("nav-logout").click();
    await expect(page).toHaveURL("/login");
    await page.goto("/customer/dashboard");
    await expect(page).toHaveURL("/login");
});

test("Authenticated agent can logout", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await page.getByTestId("nav-logout").click();
    await expect(page).toHaveURL("/login");
    await page.goto("/agent/dashboard");
    await expect(page).toHaveURL("/login");
});

test("customer opening agent dashboard is sent to customer dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("customer.a@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/customer/dashboard");
    await expect(page.getByRole("heading", { name: "Customer dashboard" })).toBeVisible();
    await page.goto("/agent/dashboard");
    await expect(page).toHaveURL("/customer/dashboard");
});

test("agent opening customer dashboard is sent to agent dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@nexo.test");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/agent/dashboard");
    await expect(page.getByRole("heading", { name: "Agent dashboard" })).toBeVisible();
    await page.goto("/customer/dashboard");
    await expect(page).toHaveURL("/agent/dashboard");
});

test("Not authenticated user cannot access any dashboard", async ({ page }) => {
    await page.goto("/customer/dashboard");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    await page.goto("/agent/dashboard");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});