import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default async function CustomerDashboardPage() {
  const session = await auth();

  return (
    <AppShell>
      <div {...loc(testId.pageCustomerDashboard)}>
        <IterationBanner>
          Iteration 2: you are signed in. Request counts land in Iteration 3.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-4 text-2xl font-semibold text-slate-900"
        >
          Customer dashboard
        </h1>
        <p className="mb-6 text-slate-700">
          Signed in as {session?.user?.name ?? "customer"}. Request summaries
          land in Iteration 3.
        </p>
        <p>
          <Link
            {...loc(testId.ctaNewRequest)}
            href="/customer/requests/new"
            className="font-medium text-nexo-accent underline"
          >
            New request
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
