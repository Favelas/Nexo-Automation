import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { StatusForm } from "@/components/StatusForm";
import { getSessionUser } from "@/lib/auth/session";
import { getVisibleRequest, statusLabel } from "@/lib/domain/requests";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Request",
};

export default async function AgentRequestDetailPage({
  params,
}: PageProps<"/agent/requests/[publicId]">) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { publicId } = await params;
  const request = await getVisibleRequest(user, publicId);
  if (!request) {
    notFound();
  }

  return (
    <AppShell>
      <div {...loc(testId.pageAgentRequestDetail)}>
        <IterationBanner>
          Iteration 4: change status here. The customer sees the same status on
          their detail.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="text-2xl font-semibold text-slate-900"
        >
          Request{" "}
          <span {...loc(testId.requestPublicId)}>{request.publicId}</span>
        </h1>
        <dl className="mt-6 grid max-w-xl gap-4 text-slate-800">
          <div>
            <dt className="text-sm font-medium text-slate-600">Customer</dt>
            <dd className="mt-1">{request.customer.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Title</dt>
            <dd {...loc(testId.requestTitle)} className="mt-1">
              {request.title}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Category</dt>
            <dd {...loc(testId.requestCategory)} className="mt-1">
              {request.category.name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Description</dt>
            <dd
              {...loc(testId.requestDescription)}
              className="mt-1 whitespace-pre-wrap"
            >
              {request.description}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Status</dt>
            <dd className="mt-1">{statusLabel(request.status)}</dd>
          </div>
        </dl>
        <StatusForm publicId={request.publicId} status={request.status} />
      </div>
    </AppShell>
  );
}
