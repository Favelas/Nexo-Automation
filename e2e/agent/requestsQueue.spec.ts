import { test, expect } from "@playwright/test";
import { AgentPage } from "../pages/agent.page";
import { LoginPage } from "../pages/login.page";
import { AgentRequestsQueuePage } from "../pages/agentRequestQueue.page";
import { AgentRequestsDetailsPage } from "../pages/agentRequestsDetails";
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
    const myRequestPage = new MyRequestsPage(page);
    const detailsPage = new RequestDetailsPage(page);
    const emailByCustomer = {
        "Ana Rivera": "customer.a@nexo.test",
        "Ben Cho": "customer.b@nexo.test",
    } as const;

    await page.goto("/agent/dashboard");
    await agentPage.requestHeaderNav.click();
    await expect(page).toHaveURL("/agent/requests");
    await expect(agentRequestsQueuePage.requestQueueTable).toBeVisible();
    const { publicId, customer } = await agentRequestsQueuePage.readRequestDetails();
    const email = emailByCustomer[customer as keyof typeof emailByCustomer];
    if (!email) {
        throw new Error(`Unknown customer in queue row: ${customer}`);
    }

    await agentRequestsQueuePage.openLatestRequest();
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);
    await agentRequestsDetailsPage.updateRequestStatus("IN_PROGRESS");
    await expect(page).toHaveURL(`/agent/requests/${publicId}`);

    await agentRequestsDetailsPage.logoutButton.click();
    await expect(page).toHaveURL("/login");

    await loginPage.login(email, "Password123!");
    await expect(page).toHaveURL("/customer/dashboard");
    await detailsPage.goto(publicId);
    await expect(detailsPage.publicId).toHaveText(publicId);
    await expect(detailsPage.status).toHaveText("In progress");
 
});
