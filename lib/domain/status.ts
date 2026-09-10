export const REQUEST_STATUSES = [
  "SUBMITTED",
  "IN_PROGRESS",
  "RESOLVED",
] as const;

export type RequestStatusName = (typeof REQUEST_STATUSES)[number];

export function isRequestStatus(value: string): value is RequestStatusName {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: RequestStatusName) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
  }
}
