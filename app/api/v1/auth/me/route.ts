import User from "@/app/models/user.model";
import connectToDatabase from "@/app/config/db.config";
import { verifyAccessToken } from "@/app/utils/auth-token.utils";
import { NextRequest, NextResponse } from "next/server";

connectToDatabase()

export async function GET(request: NextRequest){
    try {
        if(request.method !== 'GET') return NextResponse.json({success: false, error:"Method not allowed."},{status:405})

        const incomingToken = request.cookies.get('accessToken')?.value

        if(!incomingToken) return NextResponse.json({success: false, error:"Access token is missing."},{status:401})

        const verifiedToken = verifyAccessToken(incomingToken) as {_id: string}

        const {_id} = verifiedToken

        const user = await User.findById(_id).select("-password -refreshToken -otp -otpExpiry")

        if(!user) return NextResponse.json({success: false, error:"User is not authenticated."},{status: 401})

        return NextResponse.json({success: true, message:"User authenticated.", data:{user}})
         
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occuurred while getting current user: ${error.message}`)
        }else{
            console.log(`An unknown error occurred ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error"},{status: 500})
    }
}