import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request",
};

export default async function AgentRequestDetailPage({
  params,
}: PageProps<"/agent/requests/[publicId]">) {
  const { publicId } = await params;

  return (
    <AppShell role="agent">
      <IterationBanner>
        Iteration 1 placeholder. Status control lands in Iteration 4.
      </IterationBanner>
      <h1 className="text-2xl font-semibold text-slate-900">
        Request {publicId}
      </h1>
      <p className="mt-4 text-slate-700">
        An agent will change status among SUBMITTED, IN_PROGRESS, and RESOLVED
        from this page later.
      </p>
    </AppShell>
  );
}
