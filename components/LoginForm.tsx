"use client";

import { loc, testId } from "@/lib/test-ids";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Login is not connected yet. Authentication lands in Iteration 2.",
    );
  }

  return (
    <form
      {...loc(testId.loginForm)}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor={testId.loginEmail}
          className="text-sm font-medium text-slate-800"
        >
          Email
        </label>
        <input
          {...loc(testId.loginEmail)}
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-nexo-accent focus:ring-2 focus:ring-nexo-accent/30"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={testId.loginPassword}
          className="text-sm font-medium text-slate-800"
        >
          Password
        </label>
        <input
          {...loc(testId.loginPassword)}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-nexo-accent focus:ring-2 focus:ring-nexo-accent/30"
        />
      </div>
      <button
        {...loc(testId.loginSubmit)}
        type="submit"
        className="rounded bg-nexo-navy px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-nexo-accent focus:ring-offset-2"
      >
        Log in
      </button>
      {message ? (
        <p
          {...loc(testId.loginStatus)}
          role="status"
          className="text-sm text-slate-700"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
