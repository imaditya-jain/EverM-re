import { NextResponse } from "next/server"

export const ACCESS_TOKEN_MAX_AGE = 15 * 60
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60
const IS_PRODUCTION = process.env.NODE_ENV === "production"

export const setAuthCookies = (response: NextResponse, accessToken: string, refreshToken: string) => {
    response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'strict',
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE
    })

    response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "strict",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE
    })
}

export const clearAuthCookies = (response: NextResponse) => {
    response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "strict",
        path: "/",
        maxAge: 0
    })

    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "strict",
        path: "/",
        maxAge: 0
    })

}
