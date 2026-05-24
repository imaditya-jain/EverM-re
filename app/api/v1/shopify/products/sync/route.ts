import Store from "@/app/models/store.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { fetchProductsChunk } from "@/app/helpers/shopify/fetch-products";
import Product from "@/app/models/product.model";

connectToDatabase()

export async function POST(request: NextRequest) {
    try {
        if (request.method !== 'POST') return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 })

        const userId = getUserIdFromAccessToken(request)

        if (!userId) return unauthorizedResponse()

        const body = await request.json() as { cursor?: string | null }

        const cursor = body?.cursor || null;

        const store = await Store.findOne({userId, isActive: true})

        if (!store) return NextResponse.json({ success: false, error: 'Store not found.' }, { status: 404 })

        const { products, hasNextPage, nextCursor, } = await fetchProductsChunk({ shop: store.shop, accessToken: store.accessToken, cursor, });

        for (const product of products) {

            await Product.findOneAndUpdate({ storeId: store._id, shopifyProductId: product.id, },
                { storeId: store._id, shopifyProductId: product.id, title: product.title, handle: product.handle, description: product.description || "", featuredImage: product?.featuredMedia?.preview?.image?.url || "", seoTitle: product?.seo?.title || "", seoDescription: product?.seo?.description || "", status: product.status, updatedAtShopify: product.updatedAt, syncAt: new Date(), }, { upsert: true, new: true, }
            );
        }

        return NextResponse.json({ success: true, message:`${products.length} products synced.`, data:{hasNextPage, nextCursor,} }, { status: 200 })

    } catch (error) {
        if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
            return unauthorizedResponse()
        }

        if (error instanceof Error) {
            console.log(`An error occurred while syncing products, ${error.message}`)
        } else {
            console.log("An unknown error occurred while syncing products")
        }

        return NextResponse.json({ success: false, error: "Internal Server Error." }, { status: 500 })
    }
}
