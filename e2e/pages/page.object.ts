import type { Page } from "@playwright/test";

export class PageObject {
  constructor(protected readonly page: Page) {}
}
