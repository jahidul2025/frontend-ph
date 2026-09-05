export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname)
}

export type RouteConfig = {
    exact: string[];
    pattern: RegExp[];
}

export const CommonProtectedRoutes: RouteConfig = {
    pattern: [],
    exact: ["/my-profile", "/change-password"]
}

export const DoctorProtectedRoutes: RouteConfig = {
    pattern: [/\/doctors\/dashboard/],
    exact: []
}

// export const SuperAdminProtectedRoutes: RouteConfig = {
//     pattern: [/^\/admin\/dashboard/],
//     exact: []
// }
export const AdminProtectedRoutes: RouteConfig = {
    pattern: [/^\/admin\/dashboard/],
    exact: []
}

export const PatientProtectedRoutes: RouteConfig = {
    pattern: [/^\/dashboard/],
    exact: ["/dashboard"]
}

export const isRouteMatched = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) {
        return true
    }

    return routes.pattern.some((pattern: RegExp) => pattern.test(pathname))
}

export const GetRouteOwner = (pathname: string): "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
    if (isRouteMatched(pathname, CommonProtectedRoutes)) {
        return "COMMON"
    }
    if (isRouteMatched(pathname, DoctorProtectedRoutes)) {
        return "DOCTOR"
    }
    // if (isRouteMatched(pathname, SuperAdminProtectedRoutes)) {
    //     return "SUPER_ADMIN"
    // }
    if (isRouteMatched(pathname, AdminProtectedRoutes)) {
        return "ADMIN"
    }
    if (isRouteMatched(pathname, PatientProtectedRoutes)) {
        return "PATIENT"
    }
    return null
}

export const getDefaultDashboardRoute = (role: UserRole) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/admin/dashboard"
    }
    if (role === "DOCTOR") {
        return "/doctors/dashboard"
    }
    if (role === "PATIENT") {
        return "/dashboard"
    }
    return "/"
}

export const isValidRedirectPathForRole = (redirectPath: string, role: UserRole) => {
    const unifiedSuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;
    role = unifiedSuperAdminAndAdminRole;

    const routeOwner = GetRouteOwner(redirectPath);
    if (routeOwner === null || routeOwner === "COMMON") {
        return true
    }
    if (routeOwner === role) {
        return true
    }
    return false;

}