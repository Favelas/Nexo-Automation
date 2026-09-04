import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent dashboard",
};

export default function AgentDashboardPage() {
  return (
    <AppShell role="agent">
      <IterationBanner>
        Iteration 1 placeholder. Queue counts land in Iteration 4.
      </IterationBanner>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Agent dashboard
      </h1>
      <p className="mb-6 text-slate-700">
        This page will summarize the request queue after Iteration 4.
      </p>
      <p>
        <Link
          href="/agent/requests"
          className="font-medium text-nexo-accent underline"
        >
          Request queue
        </Link>
      </p>
    </AppShell>
  );
}
