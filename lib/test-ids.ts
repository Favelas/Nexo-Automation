/** Stable locator ids. Same value is set as `id` and `data-testid`. */
export const testId = {
  appHeader: "app-header",
  appMain: "app-main",
  appFooter: "app-footer",
  brand: "nav-brand",
  navPrimary: "nav-primary",
  navDashboard: "nav-dashboard",
  navMyRequests: "nav-my-requests",
  navNewRequest: "nav-new-request",
  navRequestQueue: "nav-request-queue",
  navLogout: "nav-logout",
  ctaNewRequest: "cta-new-request",
  ctaRequestQueue: "cta-request-queue",
  iterationBanner: "iteration-banner",
  pageHeading: "page-heading",
  pageLogin: "page-login",
  pageCustomerDashboard: "page-customer-dashboard",
  pageCustomerRequests: "page-customer-requests",
  pageCustomerRequestNew: "page-customer-request-new",
  pageCustomerRequestDetail: "page-customer-request-detail",
  pageAgentDashboard: "page-agent-dashboard",
  pageAgentRequests: "page-agent-requests",
  pageAgentRequestDetail: "page-agent-request-detail",
  loginForm: "login-form",
  loginEmail: "login-email",
  loginPassword: "login-password",
  loginSubmit: "login-submit",
  loginStatus: "login-status",
  requestTable: "request-table",
  requestTableEmpty: "request-table-empty",
  requestPublicId: "request-public-id",
  requestStatus: "request-status",
  requestTitle: "request-title",
  requestCategory: "request-category",
  requestDescription: "request-description",
  createRequestForm: "create-request-form",
  fieldTitle: "field-title",
  fieldCategory: "field-category",
  fieldDescription: "field-description",
  createRequestSubmit: "create-request-submit",
} as const;

export type TestId = (typeof testId)[keyof typeof testId];

export function loc(id: string) {
  return { id, "data-testid": id };
}
