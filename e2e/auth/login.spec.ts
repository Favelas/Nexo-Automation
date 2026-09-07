import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test("Valid customer lands in dashboard", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("customer.a@nexo.test", "Password123!");
  await expect(page).toHaveURL("/customer/dashboard");
  await expect(page.getByRole("heading", { name: "Customer dashboard" })).toBeVisible();
});

test("Valid agent lands in agent dashboard", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("agent@nexo.test", "Password123!");
  await expect(page).toHaveURL("/agent/dashboard");
  await expect(page.getByRole("heading", { name: "Agent dashboard" })).toBeVisible();
});

test("Invalid user lands on login page", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("invalid@nexo.test", "Password123!");
  await expect(page).toHaveURL("/login");
  await expect(loginPage.loginStatus).toHaveText("Invalid email or password.");
});

test("Invalid password lands on login page", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("customer.a@nexo.test", "invalidpassword");
  await expect(page).toHaveURL("/login");
  await expect(loginPage.loginStatus).toHaveText("Invalid email or password.");
});

test("Authenticated customer can logout", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("customer.a@nexo.test", "Password123!");
  await page.getByTestId("nav-logout").click();
  await expect(page).toHaveURL("/login");
  await page.goto("/customer/dashboard");
  await expect(page).toHaveURL("/login");
});

test("Authenticated agent can logout", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("agent@nexo.test", "Password123!");
  await page.getByTestId("nav-logout").click();
  await expect(page).toHaveURL("/login");
  await page.goto("/agent/dashboard");
  await expect(page).toHaveURL("/login");
});

test("customer opening agent dashboard is sent to customer dashboard", async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("customer.a@nexo.test", "Password123!");
  await expect(page).toHaveURL("/customer/dashboard");
  await expect(page.getByRole("heading", { name: "Customer dashboard" })).toBeVisible();
  await page.goto("/agent/dashboard");
  await expect(page).toHaveURL("/customer/dashboard");
});

test("agent opening customer dashboard is sent to agent dashboard", async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("agent@nexo.test", "Password123!");
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
