import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { exchangeAccessToken } from "@/app/helpers/shopify/exchange-access-token";
import jwt from 'jsonwebtoken'
import Store from "@/app/models/store.model";
import User from "@/app/models/user.model";

connectToDatabase()

export async function GET(request: NextRequest) {
    try {

        if (request.method !== 'GET') return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })

        const searchParams = request.nextUrl.searchParams
        const shop = searchParams.get('shop')
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        const verifiedState = jwt.verify(state!, process.env.ACCESS_TOKEN_SECRET!) as { _id: string }

        const { _id } = verifiedState

        if (!_id) {
            return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
        }

        const user = await User.findById(_id)

        if (!user) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })

        if (!shop || !code) return NextResponse.json({ success: false, error: 'Missing shop or code' }, { status: 400 })

        const tokenData = await exchangeAccessToken(shop, code);

        const accessToken = tokenData.access_token;

        if (!accessToken) return NextResponse.json({ success: false, error: "Access token is missing" }, { status: 400 })

        const store = await Store.findOneAndUpdate({ shop }, { user: user._id, shop, accessToken, scope: tokenData.scope}, { upsert: true, new: true })

        return NextResponse.json({ success: true, message:"Store connected successfully.", data:{store} }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An error occurred while callback: ${error.message}`)
        } else {
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
    }
}