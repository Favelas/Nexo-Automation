import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New request",
};

export default function NewCustomerRequestPage() {
  return (
    <AppShell>
      <div {...loc(testId.pageCustomerRequestNew)}>
        <IterationBanner>
          Iteration 1 placeholder. Creating a request lands in Iteration 3.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-6 text-2xl font-semibold text-slate-900"
        >
          New request
        </h1>
        <form {...loc(testId.createRequestForm)} className="max-w-xl">
          <fieldset
            disabled
            className="rounded-lg border border-slate-200 bg-white p-6"
          >
            <legend className="sr-only">
              Create request (not available yet)
            </legend>
            <div className="mb-4 flex flex-col gap-1">
              <label
                htmlFor={testId.fieldTitle}
                className="text-sm font-medium"
              >
                Title
              </label>
              <input
                {...loc(testId.fieldTitle)}
                name="title"
                className="rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="mb-4 flex flex-col gap-1">
              <label
                htmlFor={testId.fieldCategory}
                className="text-sm font-medium"
              >
                Category
              </label>
              <select
                {...loc(testId.fieldCategory)}
                name="category"
                className="rounded border border-slate-300 px-3 py-2"
              >
                <option value="">Select a category</option>
              </select>
            </div>
            <div className="mb-4 flex flex-col gap-1">
              <label
                htmlFor={testId.fieldDescription}
                className="text-sm font-medium"
              >
                Description
              </label>
              <textarea
                {...loc(testId.fieldDescription)}
                name="description"
                rows={5}
                className="rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              {...loc(testId.createRequestSubmit)}
              type="submit"
              className="rounded bg-nexo-navy px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              Create request
            </button>
          </fieldset>
        </form>
      </div>
    </AppShell>
  );
}
