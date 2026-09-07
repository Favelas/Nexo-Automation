import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { LoginForm } from "@/components/LoginForm";
import { loc, testId } from "@/lib/test-ids";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AppShell>
      <div {...loc(testId.pageLogin)}>
        <IterationBanner>
          Iteration 2: use a seed account. Invalid email or password shows a
          generic alert.
        </IterationBanner>
        <h1
          {...loc(testId.pageHeading)}
          className="mb-6 text-center text-2xl font-semibold text-slate-900"
        >
          Log in
        </h1>
        <LoginForm />
      </div>
    </AppShell>
  );
}
