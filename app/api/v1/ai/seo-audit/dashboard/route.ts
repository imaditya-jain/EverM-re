import Store from "@/app/models/store.model";
import User from "@/app/models/user.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import mongoose from "mongoose";

connectToDatabase()

export async function GET(request: NextRequest) {
    try {

        if (request.method !== "GET") return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 })

        const userId = getUserIdFromAccessToken(request)

        if (!userId) return unauthorizedResponse()

        const user = await User.findById(userId).select('-otp -password -otpExxpiry -refreshToken')

        if (!user) return NextResponse.json({ success: false, error: "Unauthorized. User not found." }, { status: 401 })

        const searchParams = request.nextUrl.searchParams
        const storeId = searchParams.get('storeId')

        if (!storeId) return NextResponse.json({ success: false, error: 'Store id is required.' }, { status: 400 })

        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return NextResponse.json({ success: false, error: "Invalid storeId format" }, { status: 400 });
        }

        const storeObjectId = new mongoose.Types.ObjectId(storeId);

        const storeAnalytics = await Store.aggregate([
            {
                $match: {
                    $and: [
                        {
                            userId: user._id
                        },
                        {
                            _id: storeObjectId
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { storeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$storeId", "$$storeId"]
                                }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'products_stat'
                }
            },
            {
                $lookup: {
                    from: 'seoaudits',
                    let: { storeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$storeId", "$$storeId"]
                                }
                            }
                        },
                        {
                            $facet: {
                                auditedProducts: [
                                    {
                                        $count: 'count'
                                    }
                                ],
                                auditCompletedProducts: [
                                    {
                                        $match: {
                                            auditStatus: 'COMPLETED'
                                        }
                                    },
                                    {
                                        $count: 'count'
                                    }
                                ],
                                auditFailedProducts: [
                                    {
                                        $match: {
                                            auditStatus: 'FAILED'
                                        }
                                    },
                                    {
                                        $count: 'count'
                                    }
                                ],
                                storeSeoScore: [
                                    {
                                        $group: {
                                            _id: null,
                                            score: {
                                                $avg: '$seoScore'
                                            }
                                        }
                                    },
                                    {
                                        $project:{
                                            score:{
                                                $round:['$score',2]
                                            }
                                        }
                                    }
                                ],
                                highPriorityProducts: [
                                    {
                                        $match: {
                                            priority: 'High'
                                        },
                                    },
                                    {
                                        $count: 'count'
                                    }
                                ],
                                mediumPriorityProducts: [
                                    {
                                        $match: {
                                            priority: 'Medium'
                                        },
                                    },
                                    {
                                        $count: 'count'
                                    }
                                ],
                                lowPriorityProducts: [
                                    {
                                        $match: {
                                            priority: 'Low'
                                        },
                                    },
                                    {
                                        $count: 'count'
                                    }
                                ],
                            }
                        }
                    ],
                    as: 'seo_stats'
                }
            },
            {
                $addFields: {
                    total_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$products_stat.count", 0
                                ]
                            },
                            0
                        ]
                    },
                    audited_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    { $arrayElemAt: ["$seo_stats.auditedProducts.count", 0] }, 0
                                ]
                            },
                            0
                        ]
                    },
                    audit_completed_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.auditCompletedProducts.count", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    },
                    audit_failed_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.auditFailedProducts.count", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    },
                    store_seo_score: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.storeSeoScore.score", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ],
                    },
                    high_priority_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.highPriorityProducts.count", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    },
                    medium_priority_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.mediumPriorityProducts.count", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    },
                    low_priority_products: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    {
                                        $arrayElemAt: [
                                            "$seo_stats.lowPriorityProducts.count", 0
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    },
                }
            },
            {
                $project: {
                    _id: null,
                    total_products: "$total_products",
                        audited_products: "$audited_products",
                        audit_completed_products: "$audit_completed_products",
                        audit_failed_products: "$audit_failed_products",
                        store_seo_score: "$store_seo_score",
                        high_priority_products: "$high_priority_products",
                        medium_priority_products: "$medium_priority_products",
                        low_priority_products: "$low_priority_products"
                }
            }
        ])

        return NextResponse.json({ success: true, message: '', data: { storeAnalytics } }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An error occurred while aggregating seo audits: ${error.message}`)
        } else {
            console.log(`An unknown error occurred while aggregating seo audits: ${error}`)
        }

        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 })
    }
}