import User from "@/app/models/user.model";
import connectToDatabase from "@/app/config/db.config";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { NextRequest, NextResponse } from "next/server";

connectToDatabase()

export async function GET(request: NextRequest){
    try {
        if(request.method !== 'GET') return NextResponse.json({success: false, error:"Method not allowed."},{status:405})

        const userId = getUserIdFromAccessToken(request)

        if(!userId) return unauthorizedResponse("Access token is missing or invalid.")

        const user = await User.findById(userId).select("-password -refreshToken -otp -otpExpiry")

        if(!user) return NextResponse.json({success: false, error:"User is not authenticated."},{status: 401})

        return NextResponse.json({success: true, message:"User authenticated.", data:{user}})
         
    } catch (error) {
        if(error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)){
            return unauthorizedResponse("Access token is missing or invalid.")
        }

        if(error instanceof Error){
            console.log(`An error occuurred while getting current user: ${error.message}`)
        }else{
            console.log(`An unknown error occurred ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error"},{status: 500})
    }
}
