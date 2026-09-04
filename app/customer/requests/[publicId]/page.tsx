import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request",
};

export default async function CustomerRequestDetailPage({
  params,
}: PageProps<"/customer/requests/[publicId]">) {
  const { publicId } = await params;

  return (
    <AppShell role="customer">
      <IterationBanner>
        Iteration 1 placeholder. Request body and isolation rules land in
        Iteration 3.
      </IterationBanner>
      <h1 className="text-2xl font-semibold text-slate-900">
        Request {publicId}
      </h1>
      <p className="mt-4 text-slate-700">
        Details for this public id will load from the database in a later
        iteration.
      </p>
    </AppShell>
  );
}
