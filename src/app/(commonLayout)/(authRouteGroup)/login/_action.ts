"use server";
import { ILoginResponse } from "@/types/auth.type";
import { ILoginPayload, LoginZodSchema } from "@/zod/auth.validation";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.type";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { redirect } from "next/navigation";
import { getDefaultDashboardRoute, isValidRedirectPathForRole, UserRole } from "@/lib/authUtils";

export const loginAction = async (payload: ILoginPayload, redirectPath?: string): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsedPayload = LoginZodSchema.safeParse(payload)

    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid Input"
        return {
            success: false,
            message: firstError
        }
    }
    try {
        const response = await httpClient.post<ILoginResponse>("/auth/login", parsedPayload.data);

        const { accessToken, refreshToken, token, user } = response.data;

        const { role, emailVerified, needPasswordChange, email } = user

        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);
        await setTokenInCookies("batter-auth.session_token", token)

        if (!emailVerified) {
            redirect('/verify-email')
        } else if (needPasswordChange) {
            redirect(`/reset-password?email=${email}`)
        } else {
            const targetPath = redirectPath && isValidRedirectPathForRole(redirectPath, role as UserRole) ?
                redirectPath : getDefaultDashboardRoute(role as UserRole);

            redirect(targetPath)
        }


    } catch (error: any) {
        if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {

            success: false,
            message: `login failed ${error.message}`
        }
    }
}