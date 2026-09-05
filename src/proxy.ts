import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getDefaultDashboardRoute, GetRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";


export async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;

        const DecodedAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data;

        const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success;

        let userRole: UserRole | null = null;
        if (DecodedAccessToken) {
            userRole = DecodedAccessToken.role as UserRole;
        }

        const routeOwner = GetRouteOwner(pathname);

        const UnifySuperAdminAndAdminRoles = userRole === "SUPER_ADMIN" ? "ADMIN" : userRole

        userRole = UnifySuperAdminAndAdminRoles

        const isAuth = isAuthRoute(pathname)

        if (isAuth && isValidAccessToken) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
        }

        if (routeOwner === null) {
            return NextResponse.next()
        }

        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.nextUrl)
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl)
        }

        if (routeOwner === "ADMIN" || routeOwner === "DOCTOR" || routeOwner === "PATIENT") {
            if (userRole !== routeOwner) {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
            }
        }
        if (routeOwner === "COMMON") {
            return NextResponse.next()
        }

        return NextResponse.next()
    } catch (error) {
        console.log("Error during proxy: ", error);
    }

}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known).*)",
    ],
};