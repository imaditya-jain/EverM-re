import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import Store from "@/app/models/store.model";
import Product from "@/app/models/product.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { isValidObjectId } from "mongoose";
import { shopifyGraphQLClient } from "@/app/helpers/shopify/client";
import { PRODUCT_UPDATE_MUTATION } from "@/app/graphQL/mutation";

connectToDatabase();

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

interface ShopifyGraphQLProductUpdateResponse {
    data?: {
        productUpdate?: {
            product?: {
                id: string;
                seo?: {
                    title?: string;
                    description?: string;
                };
            };
            userErrors?: {
                field: string[];
                message: string;
            }[];
        };
    };
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const userId = getUserIdFromAccessToken(request);

        if (!userId) return unauthorizedResponse();

        const { id } = await context.params;

        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid product id." },
                { status: 400 }
            );
        }

        const store = await Store.findOne({ userId, isActive: true }).sort({
            connectedAt: -1,
        });

        if (!store) {
            return NextResponse.json(
                { success: false, error: "Store not found." },
                { status: 404 }
            );
        }

        const product = await Product.findOne({ _id: id, storeId: store._id });

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found." },
                { status: 404 }
            );
        }

        const seoTitle = product.seoTitle?.trim();
        const seoDescription = product.seoDescription?.trim();

        if (!seoTitle && !seoDescription) {
            return NextResponse.json(
                { success: false, error: "No SEO data to sync." },
                { status: 400 }
            );
        }

        const variables = {
            input: {
                id: product.shopifyProductId,
                seo: {
                    title: seoTitle,
                    description: seoDescription
                }
            }
        };

        const response = await shopifyGraphQLClient<ShopifyGraphQLProductUpdateResponse>({
            shop: store.shop,
            accessToken: store.accessToken,
            query: PRODUCT_UPDATE_MUTATION,
            variables,
        });

        const userErrors = response?.data?.productUpdate?.userErrors;

        if (userErrors && userErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: userErrors[0].message },
                { status: 400 }
            );
        }

        // Update syncAt timestamp
        product.syncAt = new Date();
        await product.save();

        return NextResponse.json(
            { success: true, message: "SEO data synced to Shopify successfully." },
            { status: 200 }
        );

    } catch (error) {
        if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
            return unauthorizedResponse();
        }

        if (error instanceof Error) {
            console.log(`An error occurred while syncing back seo data: ${error.message}`);
        } else {
            console.log(`An unknown error occurred while syncing back seo data: ${error}`);
        }

        return NextResponse.json({ success: false, error: 'Internal Server Error.' }, { status: 500 });
    }
}
