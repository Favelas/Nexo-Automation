import { Page } from "@playwright/test";
import { PageObject } from "./page.object";

export class LoginPage extends PageObject {
  readonly email = this.page.getByLabel("Email");
  readonly password = this.page.getByLabel("Password");
  readonly loginButton = this.page.getByRole("button", { name: "Log in" });
  readonly loginStatus = this.page.getByTestId("login-status");

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
