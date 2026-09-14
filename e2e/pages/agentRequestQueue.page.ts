import { Page } from "@playwright/test";
import { PageObject } from "./page.object";

export class AgentRequestsQueuePage extends PageObject {
  readonly requestQueueHeader = this.page.getByTestId("page-heading");
  readonly requestQueueTable = this.page.getByTestId("request-table");

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/agent/requests");
  }

  latestRow() {
    return this.requestQueueTable.locator("tbody tr").first();
  }

  requestLink(publicId: string) {
    return this.requestQueueTable.getByRole("link", { name: publicId });
  }

  async readRequestDetails() {
    const id = await this.latestRow().locator("td").nth(0).innerText();
    const title = await this.latestRow().locator("td").nth(1).innerText();
    const customer = await this.latestRow().locator("td").nth(2).innerText();
    const status = await this.latestRow().locator("td").nth(3).innerText();
    return {
      publicId: id.trim(),
      title: title.trim(),
      customer: customer.trim(),
      status: status.trim(),
    };
  }

  async openLatestRequest() {
    await this.latestRow().getByRole("link").click();
  }
}
