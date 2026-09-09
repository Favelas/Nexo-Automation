export class DomainError extends Error {
  constructor(
    public readonly httpStatus: 400 | 403 | 404,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(public readonly fields: Record<string, string>) {
    const message = Object.values(fields)[0] ?? "Check the highlighted fields.";
    super(400, "VALIDATION_ERROR", message);
  }
}
