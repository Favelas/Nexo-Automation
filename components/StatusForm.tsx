"use client";

import {
  REQUEST_STATUSES,
  statusLabel,
  type RequestStatusName,
} from "@/lib/domain/status";
import { loc, testId } from "@/lib/test-ids";
import { FormEvent, useState } from "react";

export function StatusForm({
  publicId,
  status,
}: {
  publicId: string;
  status: RequestStatusName;
}) {
  const [nextStatus, setNextStatus] = useState<RequestStatusName>(status);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/requests/${publicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setSubmitError(body?.error?.message ?? "Could not update status.");
        return;
      }

      window.location.assign(`/agent/requests/${publicId}`);
    } catch {
      setSubmitError("Could not update status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-xs">
      <label
        htmlFor={testId.requestStatus}
        className="mb-1 block text-sm font-medium"
      >
        Status
      </label>
      <select
        {...loc(testId.requestStatus)}
        name="status"
        value={nextStatus}
        onChange={(event) =>
          setNextStatus(event.target.value as RequestStatusName)
        }
        className="w-full rounded border border-slate-300 px-3 py-2"
      >
        {REQUEST_STATUSES.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded bg-nexo-navy px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        Update status
      </button>
      {submitError ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}
    </form>
  );
}
