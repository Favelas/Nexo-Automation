import { test, expect } from "@playwright/test";

test("login form is visible and submit stays on login", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

  await page.getByLabel("Email").fill("customer.a@nexo.test");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/login");
  await expect(page.getByTestId("login-status")).toBeVisible();
});
