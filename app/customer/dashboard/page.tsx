import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { getSessionUser } from "@/lib/auth/session";
import { listVisibleRequests } from "@/lib/domain/requests";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default async function CustomerDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const requests = await listVisibleRequests(user);
  const countLabel =
    requests.length === 1
      ? "You have 1 request."
      : `You have ${requests.length} requests.`;

  return (
    <AppShell>
      <div {...loc(testId.pageCustomerDashboard)}>
        <IterationBanner>
          Iteration 3: create a request, then open it from My requests.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-4 text-2xl font-semibold text-slate-900"
        >
          Customer dashboard
        </h1>
        <p className="mb-2 text-slate-700">Signed in as {user.name}.</p>
        <p className="mb-6 text-slate-700">{countLabel}</p>
        <p className="flex flex-wrap gap-4">
          <Link
            {...loc(testId.ctaNewRequest)}
            href="/customer/requests/new"
            className="font-medium text-nexo-accent underline"
          >
            New request
          </Link>
          <Link
            href="/customer/requests"
            className="font-medium text-nexo-accent underline"
          >
            My requests
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
