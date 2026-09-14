import { PageObject } from "./page.object";
import { expect, Page } from "@playwright/test";

export class AgentRequestsDetailsPage extends PageObject {
    readonly requestDetailsHeader = this.page.getByTestId("page-heading");
    readonly statusDropdown = this.page.getByTestId("request-status");
    readonly updateRequestStatusButton = this.page.getByRole('button', { name: 'Update status' })
    readonly logoutButton = this.page.getByRole('button', { name: 'Log out' })

    constructor(page: Page) {
        super(page);
    }
    async goto() {
        await this.page.goto('/agent/requests-details');
    }
    async updateRequestStatus(status: string) {
        await this.statusDropdown.selectOption(status);
        // waitForLoadState("load") ya está fulfilled (la página ya cargó).
        // waitForEvent("load") espera la recarga del assign DESPUÉS del PATCH.
        await Promise.all([
            this.page.waitForEvent("load"),
            this.updateRequestStatusButton.click(),
        ]);
    }
}