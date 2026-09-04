import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { loc, testId } from "@/lib/test-ids";
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
      <div {...loc(testId.pageCustomerRequestDetail)}>
        <IterationBanner>
          Iteration 1 placeholder. Request body and isolation rules land in
          Iteration 3.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="text-2xl font-semibold text-slate-900"
        >
          Request <span {...loc(testId.requestPublicId)}>{publicId}</span>
        </h1>
        <p className="mt-4 text-slate-700">
          Details for this public id will load from the database in a later
          iteration.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Status: <span {...loc(testId.requestStatus)}>Unknown</span>
        </p>
      </div>
    </AppShell>
  );
}
