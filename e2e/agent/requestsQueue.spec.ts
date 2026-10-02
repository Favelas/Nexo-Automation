import { test, expect } from "@playwright/test";
import { AgentPage } from "../pages/agent.page";
import { LoginPage } from "../pages/login.page";
import { AgentRequestsQueuePage } from "../pages/agentRequestQueue.page";
import { AgentRequestsDetailsPage } from "../pages/agentRequestsDetails";
import { CustomerPage } from "../pages/customer.page";
import { NewRequestPage } from "../pages/newRequest.page";
import { MyRequestsPage } from "../pages/myRequests.page";
import { RequestDetailsPage } from "../pages/requestDetails";

test("Agent can click the request queue and review requests table", async ({ page }) => {
    const agentPage = new AgentPage(page);
    const loginPage = new LoginPage(page);
    const agentRequestsQueuePage = new AgentRequestsQueuePage(page);
    await page.goto("/agent/dashboard");
    await agentPage.requestHeaderNav.click();
    await expect(page).toHaveURL("/agent/requests");
    await expect(agentRequestsQueuePage.requestQueueHeader).toBeVisible();
    await expect(agentRequestsQueuePage.requestQueueTable).toBeVisible();
    await expect(agentRequestsQueuePage.requestQueueTable).toContainText("Ana Rivera");
    await expect(agentRequestsQueuePage.requestQueueTable).toContainText("Ben Cho");
});

test("Agent can open the latest request and validate the request details", async ({ page }) => {
    const agentPage = new AgentPage(page);
    const agentRequestsQueuePage = new AgentRequestsQueuePage(page);
    const agentRequestsDetailsPage = new AgentRequestsDetailsPage(page);
    const loginPage = new LoginPage(page);

    await page.goto("/agent/dashboard");
    await agentPage.requestHeaderNav.click();


    await expect(page).toHaveURL("/agent/requests");
    await expect(agentRequestsQueuePage.requestQueueTable).toBeVisible();
    const { publicId, title, customer, status } = await agentRequestsQueuePage.readRequestDetails();

    await agentRequestsQueuePage.openLatestRequest();
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await expect(agentRequestsDetailsPage.requestDetailsHeader).toBeVisible();
    await expect(agentRequestsDetailsPage.requestDetailsHeader).toHaveText(`Request ${publicId}`);
    
    
});

test("Agent can update the request status and customer can validate the new request status", async ({ page }) => {
    const agentPage = new AgentPage(page);
    const agentRequestsQueuePage = new AgentRequestsQueuePage(page);
    const agentRequestsDetailsPage = new AgentRequestsDetailsPage(page);
    const loginPage = new LoginPage(page);
    const customerPage = new CustomerPage(page);
    const newRequestPage = new NewRequestPage(page);
    const myRequestPage = new MyRequestsPage(page);
    const detailsPage = new RequestDetailsPage(page);
    const title = `Agent status ${Date.now()}`;

    await page.goto("/agent/dashboard");
    await agentRequestsDetailsPage.logoutButton.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await customerPage.newRequestLink.click();
    await newRequestPage.newRequest(title, "Access", "Created in this test, not seed");
    const publicId = await myRequestPage.getLatestRequestId();
    await expect(myRequestPage.latestRow()).toContainText(title);

    await myRequestPage.logoutButton.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login("agent@nexo.test", "Password123!");
    await expect(page).toHaveURL("/agent/dashboard");
    await agentPage.requestHeaderNav.click();
    await expect(page).toHaveURL("/agent/requests");
    await expect(agentRequestsQueuePage.requestQueueTable).toBeVisible();
    await agentRequestsQueuePage.requestLink(publicId).click();
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await agentRequestsDetailsPage.updateRequestStatus("IN_PROGRESS");
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);

    await agentRequestsDetailsPage.logoutButton.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login("customer.a@nexo.test", "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await detailsPage.goto(publicId);
    await expect(detailsPage.publicId).toHaveText(publicId);
    await expect(detailsPage.status).toHaveText("In progress");
});

test("Agent does not see create request", async ({ page }) => {
    await page.goto("/agent/dashboard");
    await expect(page.getByTestId("nav-new-request")).toHaveCount(0);
    await expect(page.getByTestId("cta-new-request")).toHaveCount(0);
});
