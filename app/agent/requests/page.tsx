import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { RequestTable } from "@/components/RequestTable";
import { getSessionUser } from "@/lib/auth/session";
import { listVisibleRequests } from "@/lib/domain/requests";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Request queue",
};

export default async function AgentRequestsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const requests = await listVisibleRequests(user);

  return (
    <AppShell>
      <div {...loc(testId.pageAgentRequests)}>
        <IterationBanner>
          Iteration 4: this queue lists every customer’s requests.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-6 text-2xl font-semibold text-slate-900"
        >
          Request queue
        </h1>
        <RequestTable
          caption="Request queue"
          requests={requests}
          emptyMessage="No requests in the queue."
          detailHref={(publicId) => `/agent/requests/${publicId}`}
          showCustomer
        />
      </div>
    </AppShell>
  );
}
