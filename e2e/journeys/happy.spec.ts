import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { CustomerPage } from "../pages/customer.page";
import { NewRequestPage } from "../pages/newRequest.page";
import { AgentRequestsQueuePage } from "../pages/agentRequestQueue.page";
import { AgentRequestsDetailsPage } from "../pages/agentRequestsDetails";
import { MyRequestsPage } from "../pages/myRequests.page";
import { RequestDetailsPage } from "../pages/requestDetails";
import { AgentPage } from "../pages/agent.page";

test("Happy path", async ({ page }) => {
    const customerPage = new CustomerPage(page);
    const newRequestPage = new NewRequestPage(page);
    const myRequestPage = new MyRequestsPage(page);
    const detailsPage = new RequestDetailsPage(page);
    const loginPage = new LoginPage(page);
    const agentPage = new AgentPage(page);
    const agentRequestsQueuePage = new AgentRequestsQueuePage(page);
    const agentRequestsDetailsPage = new AgentRequestsDetailsPage(page);

    await page.goto("/login");
    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    const title = "Test title";
    const category = "Access";
    const description = "Test description";
    const status = "Submitted";

    await customerPage.newRequestLink.click();
    await newRequestPage.newRequest(title, category, description);

    const publicId = await myRequestPage.getLatestRequestId();
    await expect(myRequestPage.latestRow()).toContainText(title);
    await expect(myRequestPage.latestRow()).toContainText(status);

    await customerPage.logoutLink.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login("agent@nexo.test", "Password123!");
    await expect(page).toHaveURL("/agent/dashboard");
    await agentPage.requestHeaderNav.click();   
    await expect(page).toHaveURL("/agent/requests");

    await agentRequestsQueuePage.requestLink(publicId).click();
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await agentRequestsDetailsPage.updateRequestStatus("IN_PROGRESS");
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await agentRequestsDetailsPage.updateRequestStatus("RESOLVED");
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await agentRequestsDetailsPage.logoutButton.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await detailsPage.goto(publicId);
    await expect(page).toHaveURL(`/customer/requests/${publicId}`);
    await expect(detailsPage.publicId).toHaveText(publicId);
    await expect(detailsPage.title).toHaveText(title);
    await expect(detailsPage.status).toHaveText("Resolved");
});