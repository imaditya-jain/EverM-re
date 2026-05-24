import connectToDatabase from "@/app/config/db.config";
import Product, { IProduct } from "@/app/models/product.model";
import Store from "@/app/models/store.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import type { QueryFilter } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connectToDatabase();

const getActiveStore = async (userId: string) =>
  Store.findOne({ userId, isActive: true }).sort({
    connectedAt: -1,
  });

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAccessToken(request);

    if (!userId) return unauthorizedResponse();

    const store = await getActiveStore(userId);

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 50);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const seoStatus = searchParams.get("seoStatus") || "all";

    const query: QueryFilter<IProduct> = { storeId: store._id };
    const andFilters: QueryFilter<IProduct>[] = [];

    if (search) {
      andFilters.push({
        $or: [
        { title: { $regex: search, $options: "i" } },
        { handle: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (status !== "all") {
      query.status = status.toUpperCase();
    }

    if (seoStatus === "optimized") {
      query.seoTitle = { $ne: "" };
      query.seoDescription = { $ne: "" };
    }

    if (seoStatus === "pending") {
      andFilters.push({
        $or: [{ seoTitle: "" }, { seoDescription: "" }],
      });
    }

    if (andFilters.length) {
      query.$and = andFilters;
    }

    const [products, totalProducts, optimizedProducts, filteredTotal, latestProduct] =
      await Promise.all([
        Product.find(query)
          .sort({ updatedAtShopify: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments({ storeId: store._id }),
        Product.countDocuments({
          storeId: store._id,
          seoTitle: { $ne: "" },
          seoDescription: { $ne: "" },
        }),
        Product.countDocuments(query),
        Product.findOne({ storeId: store._id }).sort({ updatedAt: -1 }).lean(),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          store: {
            shop: store.shop,
            lastSyncAt: latestProduct?.updatedAt || store.updatedAt,
          },
          stats: {
            totalProducts,
            optimizedProducts,
            pendingProducts: Math.max(totalProducts - optimizedProducts, 0),
          },
          pagination: {
            page,
            limit,
            total: filteredTotal,
            totalPages: Math.max(Math.ceil(filteredTotal / limit), 1),
          },
          products: products.map((product) => ({
            id: String(product._id),
            shopifyProductId: product.shopifyProductId,
            title: product.title,
            handle: product.handle,
            description: product.description,
            image: product.featuredImage,
            status: product.status,
            seoStatus:
              product.seoTitle && product.seoDescription ? "optimized" : "pending",
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            updatedAtShopify: product.updatedAtShopify,
            syncAt: product.syncAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return unauthorizedResponse();
    }

    if (error instanceof Error) {
      console.log(`An error occurred while fetching products: ${error.message}`);
    } else {
      console.log("An unknown error occurred while fetching products");
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
