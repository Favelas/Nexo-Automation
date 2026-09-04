import { AppShell } from "@/components/AppShell";
import { EmptyRequestTable } from "@/components/EmptyRequestTable";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My requests",
};

export default function CustomerRequestsPage() {
  return (
    <AppShell role="customer">
      <IterationBanner>
        Iteration 1 placeholder. Your requests will list here in Iteration 3.
      </IterationBanner>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">My requests</h1>
        <Link
          href="/customer/requests/new"
          className="rounded bg-nexo-navy px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New request
        </Link>
      </div>
      <EmptyRequestTable caption="Your requests" />
    </AppShell>
  );
}
