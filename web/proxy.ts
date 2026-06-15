import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// API routes are proxied to the Express backend which handles its own auth.
// Only protect actual Next.js app routes (dashboard, affiliate, onboarding).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
  "/health",
  "/api/(.*)", // backend handles its own Clerk JWT verification
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
