"use server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { setCookie } from "./cookieUtils";



const getTokenSecondRemaining = (token: string): number => {
    if (!token) return 0;

    try {
        const tokenPayload = jwt.decode(token) as JwtPayload;
        if (!tokenPayload || !tokenPayload.exp) {
            return 0;
        }

        const remainingSeconds = tokenPayload.exp - Math.floor(Date.now() / 1000);

        return remainingSeconds > 0 ? remainingSeconds : 0;

    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
}

export const setTokenInCookies = async (
    name: string,
    token: string,
    fallBackMaxAgeInSeconds: number = 24 * 60 * 60
) => {
    let maxAgeInSeconds;

    if (name !== "batter-auth.session_token") {
        maxAgeInSeconds = getTokenSecondRemaining(token);
    }

    await setCookie(name, token, maxAgeInSeconds || fallBackMaxAgeInSeconds);
}