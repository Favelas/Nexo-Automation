import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { dashboardPath } from "@/lib/auth/dashboard-path";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id =
          typeof token.id === "string" ? token.id : (token.sub ?? "");
        if (token.role === "CUSTOMER" || token.role === "AGENT") {
          session.user.role = token.role;
        }
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const role = auth?.user?.role;
      const isCustomer = path.startsWith("/customer");
      const isAgent = path.startsWith("/agent");

      if ((isCustomer || isAgent) && !auth?.user) {
        return false;
      }

      if (isAgent && role === "CUSTOMER") {
        return NextResponse.redirect(
          new URL("/customer/dashboard", request.nextUrl),
        );
      }

      if (isCustomer && role === "AGENT") {
        return NextResponse.redirect(
          new URL("/agent/dashboard", request.nextUrl),
        );
      }

      if (path === "/login" && role) {
        return NextResponse.redirect(
          new URL(dashboardPath(role), request.nextUrl),
        );
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
