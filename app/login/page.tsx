import { AppShell } from "@/components/AppShell";
import { IterationBanner } from "@/components/IterationBanner";
import { LoginForm } from "@/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AppShell role="guest">
      <IterationBanner>
        Iteration 1: the login form is on purpose. Submitting does not create a
        session yet.
      </IterationBanner>
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
        Log in
      </h1>
      <LoginForm />
    </AppShell>
  );
}
