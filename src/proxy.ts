import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getDefaultDashboardRoute, GetRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";
import { getNewTokensWithRefreshToken, getUserInfo } from "./services/auth.services";
import { isTokenExpiringSoon } from "./lib/tokenUtils";


async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
    try {
        const refresh = await getNewTokensWithRefreshToken(refreshToken);
        if (!refresh) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        return false;
    }
}

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

        if (isValidAccessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
            const requestHeaders = new Headers(request.headers);

            const response = NextResponse.next({
                request: {
                    headers: requestHeaders
                }
            });

            try {
                const refreshed = await refreshTokenMiddleware(refreshToken);
                if (refreshed) {
                    request.headers.set("x-token-refreshed", "1")
                }

                return NextResponse.next({
                    request: {
                        headers: request.headers
                    },
                    headers: response.headers
                });
            } catch (error) {
                console.error("Error in refreshTokenMiddleware:", error);
            }

            return response;
        }

        if (isAuth && isValidAccessToken) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
        }

        if (pathname === "/reset-password") {
            const email = request.nextUrl.searchParams.get("email");
            // case 1: user is logged in and need to reset password
            if (accessToken && email) {
                const userInfo = await getUserInfo();
                if (userInfo.needPasswordUpdate) {
                    return NextResponse.next();
                } else {
                    const redirect = new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl);
                    return NextResponse.redirect(redirect);
                }
            }
            // case 2: user Forgot password
            if (email) {
                return NextResponse.next();
            }

            const loginUrl = new URL("/login", request.nextUrl);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (routeOwner === null) {
            return NextResponse.next()
        }

        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.nextUrl)
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl)
        }

        if (accessToken) {
            const userInfo = await getUserInfo();

            if (userInfo.emailVerified === false) {
                if (pathname !== "/verify-email") {
                    const verifyEmailUrl = new URL("/verify-email", request.nextUrl)
                    verifyEmailUrl.searchParams.set("email", userInfo.email);
                    return NextResponse.redirect(verifyEmailUrl)
                }
                return NextResponse.next();
            }

            if (userInfo && userInfo.emailVerified && pathname === "/verify-email") {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
            }

            if (userInfo.needPasswordChange) {
                if (pathname !== "/reset-password") {
                    const redirectUrl = new URL("/reset-password", request.url);
                    redirectUrl.searchParams.set("email", userInfo.email);
                    return NextResponse.redirect(redirectUrl);
                }

                return NextResponse.next();
            }

            if (userInfo && !userInfo.needPasswordChange && pathname === "/reset-password") {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
            }
        }


        if (routeOwner === "COMMON") {
            return NextResponse.next()
        }

        if (routeOwner === "ADMIN" || routeOwner === "DOCTOR" || routeOwner === "PATIENT") {
            if (userRole !== routeOwner) {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.nextUrl))
            }
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