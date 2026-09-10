import { PageObject } from "./page.object";
import { Page } from "@playwright/test";

export class CustomerPage extends PageObject {
    readonly dashboardHeader = this.page.getByTestId("page-heading");
    readonly newRequestHeaderNav = this.page.getByTestId("nav-new-request");
    readonly newRequestLink = this.page.getByTestId("cta-new-request");
    readonly myRequestsHeaderNav = this.page.getByTestId("nav-my-requests");
    readonly myRequestsLink = this.page.getByTestId("nav-my-requests");

    constructor(page: Page) {
        super(page);
    }
async goto() {
    await this.page.goto("/customer/dashboard");
}
 

}
