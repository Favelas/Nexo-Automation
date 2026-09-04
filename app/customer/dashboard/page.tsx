import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default function CustomerDashboardPage() {
  return (
    <AppShell role="customer">
      <IterationBanner>
        Iteration 1 placeholder. Auth, counts, and live data are not wired.
      </IterationBanner>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Customer dashboard
      </h1>
      <p className="mb-6 text-slate-700">
        This page will summarize your open requests after Iteration 3.
      </p>
      <p>
        <Link
          href="/customer/requests/new"
          className="font-medium text-nexo-accent underline"
        >
          New request
        </Link>
      </p>
    </AppShell>
  );
}
