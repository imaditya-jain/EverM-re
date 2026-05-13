import User from "@/app/models/user.model";
import generateAccessAndRefreshToken from "@/app/utils/generateAccessAndRefreshToken.utils";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { setAuthCookies } from "@/app/utils/auth-cookie.utils";

connectToDatabase()

export const GET = async(request: NextRequest)=>{
    try {
        const searchParams = request.nextUrl.searchParams
        const token = searchParams.get('token')

        if(!token) return NextResponse.json({success: false, error:"Verification token is required."},{status: 400})

        const user = await User.findOne({otp: token, otpExpiry:{$gt: new Date()}})

        if(!user) return NextResponse.json({success: false, error:"Token expired or invalid"},{status: 400})

        user.isVerified = true
        user.otp = ''
        user.otpExpiry = undefined

        await user.save({ validateBeforeSave: false })

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

       const response =  NextResponse.json({success: true, message:"User verified." },{status:200})

       setAuthCookies(response, accessToken, refreshToken)

        return response
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while verifying user: ${error.message}`)
        }else{
            console.log(`An unknown error occurred, ${error}`)
        }

        return NextResponse.json({success: false, error: "Internal server error."},{status: 500})
    }
}
