import { AppShell } from "@/components/AppShell";
import { CreateRequestForm } from "@/components/CreateRequestForm";
import { IterationBanner } from "@/components/IterationBanner";
import { getSessionUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/domain/categories";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "New request",
};

export default async function NewCustomerRequestPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const categories = await listCategories();

  return (
    <AppShell>
      <div {...loc(testId.pageCustomerRequestNew)}>
        <IterationBanner>
          Iteration 3: create a request, then find it under My requests.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-6 text-2xl font-semibold text-slate-900"
        >
          New request
        </h1>
        <CreateRequestForm categories={categories} />
      </div>
    </AppShell>
  );
}
