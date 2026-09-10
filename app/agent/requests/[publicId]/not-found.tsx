import { AppShell } from "@/components/AppShell";
import { loc, testId } from "@/lib/test-ids";
import Link from "next/link";

export default function AgentRequestNotFound() {
  return (
    <AppShell>
      <div {...loc(testId.pageAgentRequestDetail)}>
        <h1
          {...loc(testId.pageHeading)}
          className="text-2xl font-semibold text-slate-900"
        >
          Request not found
        </h1>
        <p className="mt-4 text-slate-700">That request is not available.</p>
        <p className="mt-4">
          <Link
            href="/agent/requests"
            className="font-medium text-nexo-accent underline"
          >
            Back to Request queue
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
