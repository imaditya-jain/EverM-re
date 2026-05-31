import { generateSeoAudit } from "@/app/helpers/ai/seo-audit";
import Product, { IProduct } from "@/app/models/product.model";
import SeoAudits from "@/app/models/seo-audit.model";
import Store from "@/app/models/store.model";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";

connectToDatabase()

export async function GET(request: NextRequest) {
    try {
        const userId = getUserIdFromAccessToken(request)

        if(!userId) return unauthorizedResponse()

        const user = await User.findById(userId).select('-otp -otpExpiry -password -refreshToken')

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. User not found." },
                { status: 401 }
            )
        }

        const store = await Store.findOne({ userId: user._id })

        if (!store) {
            return NextResponse.json(
                { success: false, error: "Store not found." },
                { status: 404 }
            )
        }

        const limit = 5;
        let page = 1;
        let hasMore = true;

        let totalAudited = 0;
        const failedAudits = [];

        while (hasMore) {
            const skip = (page - 1) * limit;

            const products = await Product.find({ storeId: store?._id })
                .skip(skip)
                .limit(limit)
                .lean() as IProduct[];

            if (!products || products.length === 0) {
                hasMore = false;
                break;
            }

            const batchResults = await Promise.allSettled(
                products.map(async (product) => {
                    try {
                        const audit = await generateSeoAudit({
                            title: product?.title,
                            seoTitle: product?.seoTitle,
                            seoDescription: product?.seoDescription,
                            handle: product?.handle
                        });

                        await SeoAudits.findOneAndUpdate({ $and: [{ storeId: store._id }, { productId: product._id }] }, { storeId: store._id, productId: product._id, seoScore: audit?.scores?.overall, titleScore: audit?.scores?.title, descriptionScore: audit?.scores?.description, handleScore: audit?.scores?.handle, issues: audit?.issues, recommendations: audit?.recommendations, strengths: audit?.strengths, priority: audit?.priority, auditStatus: audit?.status }, { new: true, upsert: true })

                        return { success: true, productId: product._id, audit };
                    } catch (error) {
                        return {
                            success: false,
                            productId: product._id,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        };
                    }
                })
            );

            for (const result of batchResults) {
                if (result.status === 'fulfilled' && result.value.success) {
                    totalAudited++;
                } else if (result.status === 'rejected') {
                    failedAudits.push(result.reason);
                }
            }

            page++;

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return NextResponse.json({
            success: true,
            message: "SEO audit completed",
            data: {
                totalAudited,
                failedCount: failedAudits.length,
                failedAudits: failedAudits.slice(0, 10)
            }
        }, { status: 200 });

    } catch (error) {
        console.error("An error occurred while storing seo audit:", error);

        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        )
    }
}