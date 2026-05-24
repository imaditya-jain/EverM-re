import connectToDatabase from "@/app/config/db.config";
import Product from "@/app/models/product.model";
import Store from "@/app/models/store.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connectToDatabase();

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const getActiveStore = async (userId: string) =>
  Store.findOne({ userId, isActive: true }).sort({
    connectedAt: -1,
  });

export async function GET(request: NextRequest, context: RouteContext) {
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

    const store = await getActiveStore(userId);

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
      );
    }

    const product = await Product.findOne({ _id: id, storeId: store._id }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          store: { shop: store.shop },
          product: {
            id: String(product._id),
            shopifyProductId: product.shopifyProductId,
            title: product.title,
            handle: product.handle,
            description: product.description,
            image: product.featuredImage,
            status: product.status,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            seoStatus:
              product.seoTitle && product.seoDescription ? "optimized" : "pending",
            updatedAtShopify: product.updatedAtShopify,
            syncAt: product.syncAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return unauthorizedResponse();
    }

    if (error instanceof Error) {
      console.log(`An error occurred while fetching product: ${error.message}`);
    } else {
      console.log("An unknown error occurred while fetching product");
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const store = await getActiveStore(userId);

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      seoTitle?: string;
      seoDescription?: string;
    };

    const seoTitle = body.seoTitle?.trim() || "";
    const seoDescription = body.seoDescription?.trim() || "";

    if (!seoTitle || !seoDescription) {
      return NextResponse.json(
        { success: false, error: "SEO title and description are required." },
        { status: 400 }
      );
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, storeId: store._id },
      { seoTitle, seoDescription },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "SEO saved successfully.",
        data: {
          product: {
            id: String(product._id),
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return unauthorizedResponse();
    }

    if (error instanceof Error) {
      console.log(`An error occurred while updating product: ${error.message}`);
    } else {
      console.log("An unknown error occurred while updating product");
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
