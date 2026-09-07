import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request",
};

export default async function AgentRequestDetailPage({
  params,
}: PageProps<"/agent/requests/[publicId]">) {
  const { publicId } = await params;

  return (
    <AppShell>
      <div {...loc(testId.pageAgentRequestDetail)}>
        <IterationBanner>
          Iteration 1 placeholder. Status control lands in Iteration 4.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="text-2xl font-semibold text-slate-900"
        >
          Request <span {...loc(testId.requestPublicId)}>{publicId}</span>
        </h1>
        <p className="mt-4 text-slate-700">
          An agent will change status among SUBMITTED, IN_PROGRESS, and RESOLVED
          from this page later.
        </p>
        <div className="mt-4 max-w-xs">
          <label
            htmlFor={testId.requestStatus}
            className="mb-1 block text-sm font-medium"
          >
            Status
          </label>
          <select
            {...loc(testId.requestStatus)}
            disabled
            className="w-full rounded border border-slate-300 px-3 py-2 disabled:opacity-60"
          >
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>
    </AppShell>
  );
}
