import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/servers(.*)",
  "/channels(.*)",
  "/messages(.*)",
  "/users(.*)",
  "/settings(.*)"
]);

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth();
  console.log({ authObj });
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  if (isProtectedRoute(req) && !authObj.userId) {
    return auth().then(a => a.redirectToSignIn());
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
};
