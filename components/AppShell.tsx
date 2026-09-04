import Link from "next/link";

export type ShellRole = "guest" | "customer" | "agent";

const customerLinks = [
  { href: "/customer/dashboard", label: "Dashboard" },
  { href: "/customer/requests", label: "My requests" },
  { href: "/customer/requests/new", label: "New request" },
] as const;

const agentLinks = [
  { href: "/agent/dashboard", label: "Dashboard" },
  { href: "/agent/requests", label: "Request queue" },
] as const;

export function AppShell({
  role,
  children,
}: {
  role: ShellRole;
  children: React.ReactNode;
}) {
  const links =
    role === "customer" ? customerLinks : role === "agent" ? agentLinks : [];

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-800 bg-nexo-navy text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <p className="text-lg font-semibold tracking-tight">
            <Link
              href={role === "guest" ? "/login" : links[0].href}
              className="hover:underline"
            >
              Nexo
            </Link>
          </p>
          {role !== "guest" ? (
            <nav
              aria-label="Primary"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:underline"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded border border-white/40 px-2 py-1 hover:bg-white/10"
              >
                Log out
              </Link>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600">
        Nexo — internal request tracker (lab). Iteration 1 skeleton.
      </footer>
    </div>
  );
}
