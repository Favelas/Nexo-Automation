import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New request",
};

export default function NewCustomerRequestPage() {
  return (
    <AppShell role="customer">
      <IterationBanner>
        Iteration 1 placeholder. Creating a request lands in Iteration 3.
      </IterationBanner>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        New request
      </h1>
      <form className="max-w-xl">
        <fieldset
          disabled
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <legend className="sr-only">
            Create request (not available yet)
          </legend>
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              className="rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="">Select a category</option>
            </select>
          </div>
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-nexo-navy px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            Create request
          </button>
        </fieldset>
      </form>
    </AppShell>
  );
}
