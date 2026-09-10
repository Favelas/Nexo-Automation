import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { getSessionUser } from "@/lib/auth/session";
import { listVisibleRequests, statusLabel } from "@/lib/domain/requests";
import { REQUEST_STATUSES } from "@/lib/domain/status";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Agent dashboard",
};

export default async function AgentDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const requests = await listVisibleRequests(user);
  const counts = REQUEST_STATUSES.map((status) => ({
    status,
    label: statusLabel(status),
    count: requests.filter((request) => request.status === status).length,
  }));

  return (
    <AppShell>
      <div {...loc(testId.pageAgentDashboard)}>
        <IterationBanner>
          Iteration 4: open the queue, then change a request’s status.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-4 text-2xl font-semibold text-slate-900"
        >
          Agent dashboard
        </h1>
        <p className="mb-2 text-slate-700">Signed in as {user.name}.</p>
        <ul className="mb-6 list-inside list-disc text-slate-700">
          {counts.map((row) => (
            <li key={row.status}>
              {row.label}: {row.count}
            </li>
          ))}
        </ul>
        <p>
          <Link
            {...loc(testId.ctaRequestQueue)}
            href="/agent/requests"
            className="font-medium text-nexo-accent underline"
          >
            Request queue
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
