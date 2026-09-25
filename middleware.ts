import { NextResponse, type NextRequest } from "next/server";
import { hasAdminCredentials } from "@/lib/adminAuth";

export function middleware(request: NextRequest) {
  if (!hasAdminCredentials(request)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Krillion admin"' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
