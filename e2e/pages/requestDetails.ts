import { Page } from "@playwright/test";
import { PageObject } from "./page.object";

export class RequestDetailsPage extends PageObject {
  readonly heading = this.page.getByTestId("page-heading");
  readonly publicId = this.page.getByTestId("request-public-id");
  readonly title = this.page.getByTestId("request-title");
  readonly category = this.page.getByTestId("request-category");
  readonly description = this.page.getByTestId("request-description");
  readonly status = this.page.getByTestId("request-status");

  constructor(page: Page) {
    super(page);
  }

  async goto(publicId: string) {
    await this.page.goto(`/customer/requests/${publicId}`);
  }
}
