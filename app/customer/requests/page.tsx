import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { RequestTable } from "@/components/RequestTable";
import { getSessionUser } from "@/lib/auth/session";
import { listVisibleRequests } from "@/lib/domain/requests";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My requests",
};

export default async function CustomerRequestsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const requests = await listVisibleRequests(user);

  return (
    <AppShell>
      <div {...loc(testId.pageCustomerRequests)}>
        <IterationBanner>
          Iteration 3: this list is your requests only.
        </IterationBanner>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1
            {...loc(testId.pageHeading)}
            className="text-2xl font-semibold text-slate-900"
          >
            My requests
          </h1>
          <Link
            {...loc(testId.ctaNewRequest)}
            href="/customer/requests/new"
            className="rounded bg-nexo-navy px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New request
          </Link>
        </div>
        <RequestTable
          caption="Your requests"
          requests={requests}
          emptyMessage="No requests yet."
          detailHref={(publicId) => `/customer/requests/${publicId}`}
        />
      </div>
    </AppShell>
  );
}
