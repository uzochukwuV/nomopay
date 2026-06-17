import { clerkMiddleware } from "@clerk/nextjs/server";

export const proxy = clerkMiddleware(async (auth) => {
  await auth.protect();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
