import { test, expect } from "@playwright/test";
import { CustomerPage } from "../pages/customer.page";
import { NewRequestPage } from "../pages/newRequest.page";
import { MyRequestsPage } from "../pages/myRequests.page";
import { RequestDetailsPage } from "../pages/requestDetails";
import { LoginPage } from "../pages/login.page";

test("Customer can navigate to new request page", async ({ page }) => {
    const customerPage = new CustomerPage(page);    
    const newRequestPage = new NewRequestPage(page);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await customerPage.newRequestLink.click();
    await expect(newRequestPage.newRequestHeader).toBeVisible();
    await expect(newRequestPage.titleInput).toBeVisible();
    await expect(newRequestPage.categoryDropdown).toBeVisible();
    await expect(newRequestPage.descriptionInput).toBeVisible();
    await expect(newRequestPage.createRequestButton).toBeVisible();
});

test("Customer can create a new request, see it in my requests and validate details", async ({ page }) => {
    const customerPage = new CustomerPage(page);
    const newRequestPage = new NewRequestPage(page);
    const myRequestPage = new MyRequestsPage(page);
    const detailsPage = new RequestDetailsPage(page);
    const loginPage = new LoginPage(page);

    const title = "Test title";
    const category = "Access";
    const description = "Test description";
    const status = "Submitted";

    await loginPage.goto();
    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await customerPage.newRequestLink.click();
    await newRequestPage.newRequest(title, category, description);

    const publicId = await myRequestPage.getLatestRequestId();
    await expect(myRequestPage.latestRow()).toContainText(title);
    await expect(myRequestPage.latestRow()).toContainText(status);

    await myRequestPage.openLatestRequest();
    await expect(page).toHaveURL(`/customer/requests/${publicId}`);
    await expect(detailsPage.publicId).toHaveText(publicId);
    await expect(detailsPage.title).toHaveText(title);
    await expect(detailsPage.category).toHaveText(category);
    await expect(detailsPage.description).toHaveText(description);
    await expect(detailsPage.status).toHaveText(status);
});

test("Customer restricted to add new request if required fields are not filled", async ({ page }) => {
    const customerPage = new CustomerPage(page);
    const newRequestPage = new NewRequestPage(page);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await customerPage.newRequestLink.click();
    await newRequestPage.createRequestButton.click();
    await expect(newRequestPage.titleFieldError).toBeVisible();
    await expect(newRequestPage.categoryFieldError).toBeVisible();
    await expect(newRequestPage.descriptionFieldError).toBeVisible();
});

test("Customer create request and another user cannot see it", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const customerPage = new CustomerPage(page);
    const newRequestPage = new NewRequestPage(page);
    const myRequestPage = new MyRequestsPage(page);
    const detailsPage = new RequestDetailsPage(page);

    await loginPage.goto();
    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await customerPage.newRequestLink.click();
    await newRequestPage.newRequest("Isolation title", "Access", "Only customer A");

    const createdPublicId = await myRequestPage.getLatestRequestId();
    await myRequestPage.logoutButton.click();
    await expect(page).toHaveURL("/login");
    await loginPage.login("customer.b@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await detailsPage.goto(createdPublicId);
    await expect(detailsPage.heading).toHaveText("Request not found");
    await expect(page.getByText("That request is not available.")).toBeVisible();
});
