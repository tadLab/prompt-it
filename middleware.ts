import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Capture referral code from URL into cookie
  const refCode = request.nextUrl.searchParams.get("ref");
  if (refCode && !request.cookies.get("prompt-it-ref")) {
    response.cookies.set("prompt-it-ref", refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
