import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { verifyRefreshToken } from "@/app/utils/auth-token.utils";
import User from "@/app/models/user.model";
import { clearAuthCookies } from "@/app/utils/auth-cookie.utils";

connectToDatabase()

export async function POST(request: NextRequest) {
    try {
        if(request.method !== "POST") return NextResponse.json({success: false, error:"Method not allowed."}, {status: 405})

        const incomingRefreshToken = request.cookies.get('refreshToken')?.value

        const response = NextResponse.json({success: true, message: "Logged out successfully."}, {status: 200})

        if (!incomingRefreshToken) {
            clearAuthCookies(response)

            return response
        }

        try {
            const verifiedToken =  verifyRefreshToken(incomingRefreshToken)
            const { _id } = verifiedToken as { _id?: string }

            if (_id) {
                const user = await User.findById(_id)

                if (user && user.compareRefreshToken(incomingRefreshToken)) {
                    user.refreshToken = ""
                    await user.save()
                }
            }
        } catch (error) {
            if (!(error instanceof Error && ["JsonWebTokenError", "TokenExpiredError"].includes(error.name))) {
                throw error
            }
        }

        clearAuthCookies(response)

        return response

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An error occurred while logout: ${error.message}`)
        }else{
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error."},{status: 500})
    }
}
