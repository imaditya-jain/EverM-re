import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest){
    try {
        
        if(request.method !== "PATCH") return NextResponse.json({success: false, error:"Method not allowed."},{status: 405})

        const {password} = await request.json()

        const searchParams = request.nextUrl.searchParams
        const token = searchParams.get('token')

        const user = await User.findOne({otp:token, otpExpiry: {$gt: new Date()}})

        if(!user) return NextResponse.json({success: false, error:"Token expired or invalid"},{status: 400})

        user.otp = ""
        user.otpExpiry = undefined
        user.password = password

        await user.save()

        return NextResponse.json({success: true, message:"Password reset successfully."},{status: 200})

    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while reseting password.`)
        }else{
            console.log(`An unknown error occurred.`)
        }

        return NextResponse.json({success: false, error:"Internal server error."},{status:500})
    }
}