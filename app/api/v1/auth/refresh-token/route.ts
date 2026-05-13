import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { verifyRefreshToken } from "@/app/utils/auth-token.utils";
import User from "@/app/models/user.model";
import { clearAuthCookies, setAuthCookies } from "@/app/utils/auth-cookie.utils";
import generateAccessAndRefreshToken from "@/app/utils/generateAccessAndRefreshToken.utils";

connectToDatabase()

export async function POST(request: NextRequest) {
    try {
        if (request.method !== "POST") return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 })

        const incomingToken = request.cookies.get('refreshToken')?.value

        if (!incomingToken) return NextResponse.json({ success: false, error: 'Refresh token is missing.' }, { status: 401 })

        const verifiedToken = verifyRefreshToken(incomingToken.toString())

        const { _id } = verifiedToken as { _id: string }

        const user = await User.findById(_id)

        if (!user) return NextResponse.json({ success: false, error: "User not found." }, { status: 401 })

        const isRefreshTokenMatch = user.compareRefreshToken(incomingToken.toString())

        if (!isRefreshTokenMatch) {
            const response = NextResponse.json({ success: false, error: 'Invalid refresh token.' }, { status: 401 })

            clearAuthCookies(response)

            return response
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        user.refreshToken = refreshToken
        await user.save()

        const response = NextResponse.json({ success: true, message: 'Session refreshed.' }, { status: 200 })

        setAuthCookies(response, accessToken, refreshToken)

        return response

    } catch (error) {
        if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError"].includes(error.name)) {
            const response = NextResponse.json({ success: false, error: 'Invalid refresh token.' }, { status: 401 })

            clearAuthCookies(response)

            return response
        }

        if (error instanceof Error) {
            console.log(`An error occurred while refreshing token: ${error.message}`)
        } else {
            console.log(`An unknown error occurred while refreshing token.`)
        }

        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
    }
}
