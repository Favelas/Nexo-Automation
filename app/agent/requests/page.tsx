import { AppShell } from "@/components/AppShell";
import { EmptyRequestTable } from "@/components/EmptyRequestTable";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request queue",
};

export default function AgentRequestsPage() {
  return (
    <AppShell role="agent">
      <IterationBanner>
        Iteration 1 placeholder. The agent queue lands in Iteration 4.
      </IterationBanner>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Request queue
      </h1>
      <EmptyRequestTable caption="Request queue" />
    </AppShell>
  );
}
