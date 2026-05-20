import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto'
import sendMailHelper from "@/app/helpers/mail/send-mail.helper";
import connectToDatabase from "@/app/config/db.config";

connectToDatabase()

export async function POST (request:NextRequest){
    try {

        if(request.method !== "POST") return NextResponse.json({success: false, error:"Method not allowed."},{status: 405})

        const {loginId} = await request.json()

        if(!loginId) return NextResponse.json({success: false, error:"Please provide email/username."},{status:400})

        const isUserExist = await User.findOne({$or:[{email:loginId}, {userName:loginId}]})

        if(!isUserExist) return NextResponse.json({success: false, error:"User not found."},{status: 404})

        const verifyToken = crypto.randomBytes(32).toString("hex")

        isUserExist.otp = verifyToken
        isUserExist.otpExpiry = new Date(Date.now() + 5 * 60 * 1000) 

        await isUserExist.save({ validateBeforeSave: false })

        const baseUrl = request.nextUrl.origin

        const data = {
            name: `${isUserExist.firstName} ${isUserExist.lastName}`,
            email: isUserExist.email,
            verificationLink: `${baseUrl}/auth/reset-password?token=${verifyToken}`
        }

        await sendMailHelper('FORGOT_PASSWORD', data)

        return NextResponse.json({success: true, message:"Password reset link has been sent to your registered email."},{status: 200})
        
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while resetting password: ${error.message}`)
        }else{
            console.log(`An unknown error occurred.`)
        }

        return NextResponse.json({error:'Internal error '},{status: 500})
    }
}