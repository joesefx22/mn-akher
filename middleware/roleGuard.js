// middleware/roleGuard.js
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/utils/auth";

const roleGuard = (allowedRoles = []) => {
  return async function middleware(req) {
    try {
      const token = req.cookies.get("token")?.value;
      if (!token) return NextResponse.redirect(new URL("/login", req.url));

      const user = verifyAuthToken(token);
      if (!user) return NextResponse.redirect(new URL("/login", req.url));

      if (!allowedRoles.includes(user.role)) {
        return new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }

      return NextResponse.next();
    } catch (err) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  };
};

export default roleGuard;
