import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export { auth as proxy };
export default auth;

export const config = {
  matcher: ["/login", "/customer/:path*", "/agent/:path*"],
};
