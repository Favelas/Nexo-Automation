import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent dashboard",
};

export default async function AgentDashboardPage() {
  const session = await auth();

  return (
    <AppShell>
      <div {...loc(testId.pageAgentDashboard)}>
        <IterationBanner>
          Iteration 2: you are signed in. Queue counts land in Iteration 4.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-4 text-2xl font-semibold text-slate-900"
        >
          Agent dashboard
        </h1>
        <p className="mb-6 text-slate-700">
          Signed in as {session?.user?.name ?? "agent"}. Queue summaries land in
          Iteration 4.
        </p>
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
