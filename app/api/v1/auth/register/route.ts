import { NextRequest, NextResponse } from "next/server"
import User from "@/app/models/user.model"
import connectToDatabase from "@/app/config/db.config"
import sendMailHelper from "@/app/helper/send-mail.helper"
import crypto from "crypto"

connectToDatabase()

export async function POST(request:NextRequest){
    try {
        if(request.method !== 'POST') return NextResponse.json({success: false, error:"Method not allowed."},{status: 405})

        const body = await request.json()

        const {firstName, lastName, userName, email, phone, password} = body

        if(!firstName || !lastName || !userName || !email || !password) return NextResponse.json({success: false, error:"Provide all required fields."},{status: 400})

        const isUserExist = await User.findOne({$or:[{email},{userName}]})

        if(isUserExist) return NextResponse.json({success: false, error:"User already exist."},{status: 409})

        const newUser = new User({firstName, lastName, userName, email, phone, password})

        const createdUser = await newUser.save()

        const isUserCreated = await User.findById(createdUser._id)

        if(!isUserCreated) return NextResponse.json({success: false, error:"Something went wrong."},{status: 400})

        const verifyToken = crypto.randomBytes(32).toString("hex")

        createdUser.otp = verifyToken
        createdUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000) 

        await createdUser.save({ validateBeforeSave: false })

        const baseUrl = request.nextUrl.origin

        const data = {
            name: `${createdUser.firstName} ${createdUser.lastName}`,
            email: createdUser.email,
            verificationLink: `${baseUrl}/auth/verify-user?token=${verifyToken}`
        }

        await sendMailHelper('VERIFY_USER', data)

        return NextResponse.json({success: true, message:"User created successfully."},{status: 201})
        
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while registering user: ${error.message}`)
        }else{
            console.log(`An unknown error occured: ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal Server Error"},{status: 500})
    }
}