import { logout } from "@/lib/auth/actions";
import { auth } from "@/auth";
import { loc, testId } from "@/lib/test-ids";
import Link from "next/link";

export type ShellRole = "guest" | "customer" | "agent";

const customerLinks = [
  {
    href: "/customer/dashboard",
    label: "Dashboard",
    id: testId.navDashboard,
  },
  {
    href: "/customer/requests",
    label: "My requests",
    id: testId.navMyRequests,
  },
  {
    href: "/customer/requests/new",
    label: "New request",
    id: testId.navNewRequest,
  },
] as const;

const agentLinks = [
  {
    href: "/agent/dashboard",
    label: "Dashboard",
    id: testId.navDashboard,
  },
  {
    href: "/agent/requests",
    label: "Request queue",
    id: testId.navRequestQueue,
  },
] as const;

function roleFromSession(
  role: string | undefined,
): Exclude<ShellRole, "guest"> | null {
  if (role === "AGENT") {
    return "agent";
  }
  if (role === "CUSTOMER") {
    return "customer";
  }
  return null;
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = roleFromSession(session?.user?.role) ?? "guest";
  const links =
    role === "customer" ? customerLinks : role === "agent" ? agentLinks : [];

  return (
    <div className="flex min-h-full flex-col">
      <header
        {...loc(testId.appHeader)}
        className="border-b border-slate-800 bg-nexo-navy text-white"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <p className="text-lg font-semibold tracking-tight">
            <Link
              {...loc(testId.brand)}
              href={role === "guest" ? "/login" : links[0].href}
              className="hover:underline"
            >
              Nexo
            </Link>
          </p>
          {role !== "guest" ? (
            <nav
              {...loc(testId.navPrimary)}
              aria-label="Primary"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  {...loc(link.id)}
                  href={link.href}
                  className="hover:underline"
                >
                  {link.label}
                </Link>
              ))}
              <form action={logout}>
                <button
                  type="submit"
                  {...loc(testId.navLogout)}
                  className="rounded border border-white/40 px-2 py-1 hover:bg-white/10"
                >
                  Log out
                </button>
              </form>
            </nav>
          ) : null}
        </div>
      </header>
      <main
        {...loc(testId.appMain)}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"
      >
        {children}
      </main>
      <footer
        {...loc(testId.appFooter)}
        className="border-t border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-600"
      >
        Nexo — internal request tracker (lab). Iteration 2 auth.
      </footer>
    </div>
  );
}
