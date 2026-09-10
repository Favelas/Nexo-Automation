import { Page } from "@playwright/test";
import { PageObject } from "./page.object";

export class MyRequestsPage extends PageObject {
  readonly heading = this.page.getByRole("heading", { name: "My requests" });
  readonly table = this.page.getByTestId("request-table");
  readonly myRequestsLink = this.page.getByTestId("nav-my-requests");
  readonly logoutButton = this.page.getByTestId("nav-logout");

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/customer/requests");
  }

  latestRow() {
    return this.table.locator("tbody tr").first();
  }

  requestLink(publicId: string) {
    return this.table.getByRole("link", { name: publicId });
  }

  async getLatestRequestId() {
    const text = await this.latestRow().locator("td").first().innerText();
    return text.trim();
  }

  async openLatestRequest() {
    await this.latestRow().getByRole("link").click();
  }
}
