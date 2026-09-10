import { PageObject } from "./page.object";
import { Page } from "@playwright/test";

export class NewRequestPage extends PageObject {
    readonly newRequestHeader = this.page.getByRole("heading", { name: "New request" });
    readonly titleInput = this.page.getByTestId("field-title");
    readonly categoryDropdown = this.page.getByTestId("field-category");
    readonly descriptionInput = this.page.getByTestId("field-description");
    readonly createRequestButton = this.page.getByRole("button", { name: "Create request" });
    readonly titleFieldError = this.page.getByText("Title is required.");
    readonly categoryFieldError = this.page.getByText("Category is required.");
    readonly descriptionFieldError = this.page.getByText("Description is required.");

    constructor(page: Page) {
        super(page);
    }

    async goto() {
        await this.page.goto("/customer/requests/new");
    }

    async newRequest(title: string, category: string, description: string) {
        // Usas los parámetros en la firma pero rellenas strings fijos. El test de vacíos ("","","")
        // igual crea "Test title" / Access. El spec además hace click otra vez (doble submit).
        // Sugerido:
        await this.titleInput.fill(title);
        if (category) await this.categoryDropdown.selectOption(category);
        await this.descriptionInput.fill(description);
        await this.createRequestButton.click();
    }

}