export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|api/auth|api/images|manifest.json|icons|_next/static|_next/image|favicon.ico).*)",
  ],
};
