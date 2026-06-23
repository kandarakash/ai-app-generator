import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const path = req.nextUrl.pathname;

        // Public paths — no auth needed
        if (path === "/" || path.startsWith("/login") || path.startsWith("/api/auth")) {
          return true;
        }

        // All other API routes require auth
        if (path.startsWith("/api")) {
          return token !== null;
        }

        // Page routes — let the page component handle redirects
        // (Server components use getCurrentUser, client components use useSession)
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/api/:path*", "/builder", "/apps/:path*"],
};
