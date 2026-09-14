import { PageObject } from "./page.object";
import { Page } from "@playwright/test";

export class AgentPage extends PageObject {
    readonly agentDashboardHeader = this.page.getByTestId("page-heading");
    readonly requestHeaderNav = this.page.getByTestId("nav-request-queue");

    constructor(page: Page) {
        super(page);
    }
    async goto() {
        await this.page.goto('/agent/dashboard');
    }
}

