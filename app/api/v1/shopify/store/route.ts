import connectToDatabase from "@/app/config/db.config";
import Product from "@/app/models/product.model";
import Store from "@/app/models/store.model";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import { NextRequest, NextResponse } from "next/server";

connectToDatabase();

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAccessToken(request);

    if (!userId) return unauthorizedResponse();

    const store = await Store.findOne({
      userId,
      isActive: true,
    }).sort({ connectedAt: -1 });

    if (!store) {
      return NextResponse.json(
        { success: true, data: { connected: false } },
        { status: 200 }
      );
    }

    const [totalProducts, latestProduct] = await Promise.all([
      Product.countDocuments({ storeId: store._id }),
      Product.findOne({ storeId: store._id }).sort({ updatedAt: -1 }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          connected: true,
          store: {
            id: String(store._id),
            shop: store.shop,
            connectedAt: store.connectedAt,
            totalProducts,
            syncedProducts: totalProducts,
            syncingProducts: 0,
            notSyncedProducts: 0,
            failedProducts: 0,
            collections: 0,
            lastSyncAt: latestProduct?.updatedAt || store.updatedAt || null,
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
      console.log(`An error occurred while fetching store: ${error.message}`);
    } else {
      console.log("An unknown error occurred while fetching store");
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromAccessToken(request);

    if (!userId) return unauthorizedResponse();

    const store = await Store.findOneAndUpdate(
      { userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Store disconnected successfully." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return unauthorizedResponse();
    }

    if (error instanceof Error) {
      console.log(`An error occurred while disconnecting store: ${error.message}`);
    } else {
      console.log("An unknown error occurred while disconnecting store");
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
