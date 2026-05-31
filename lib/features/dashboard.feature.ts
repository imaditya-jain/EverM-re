import { authFetch } from "@/app/lib/auth-fetch";
import type {
    DashboardAnalytics,
    DashboardApiResponse,
    DashboardApiStats,
    DashboardStoreStatusResponse,
} from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

interface RejectError {
    success: boolean;
    error: string;
}

const normalizeDashboardData = (
    analytics: DashboardApiStats,
    storeStatus?: DashboardStoreStatusResponse["data"]
): DashboardAnalytics | null => {
    const store = storeStatus?.store;

    if (store == null) return null;

    return {
        store: {
            id: store.id,
            shop: store.shop,
            connectedAt: store.connectedAt,
            lastSyncAt: store.lastSyncAt,
        },
        total_products: analytics.total_products,
        audited_products: analytics.audited_products,
        audit_completed_products: analytics.audit_completed_products,
        audit_failed_products: analytics.audit_failed_products,
        store_seo_score: analytics.store_seo_score,
        high_priority_products: analytics.high_priority_products,
        medium_priority_products: analytics.medium_priority_products,
        low_priority_products: analytics.low_priority_products,
    };
};

export const getDashboardHandler = createAsyncThunk<
    ApiResponse<DashboardAnalytics>,
    void,
    { rejectValue: RejectError }
>("dashboard/getDashboard", async (_, { rejectWithValue }) => {
    try {
        const storeResponse = await authFetch("/api/v1/shopify/store", { method: "GET", cache: "no-store" });
        const storeResult: DashboardStoreStatusResponse = await storeResponse.json();

        if (!storeResponse.ok || !storeResult.success) {
            return rejectWithValue({
                success: false,
                error: storeResult.error ?? "Unable to load store status.",
            });
        }

        if (storeResult.data?.connected !== true) {
            return rejectWithValue({
                success: false,
                error: "Connect your Shopify store to view dashboard analytics.",
            });
        }

        const storeId = storeResult.data?.store?.id;

        if (storeId == null) {
            return rejectWithValue({
                success: false,
                error: "Store id is required to load dashboard analytics.",
            });
        }

        const dashboardResponse = await authFetch(`/api/v1/ai/seo-audit/dashboard?storeId=${storeId}`, {
            method: "GET",
            cache: "no-store",
        });

        const dashboardResult: DashboardApiResponse = await dashboardResponse.json();

        if (!dashboardResponse.ok || !dashboardResult.success) {
            return rejectWithValue({
                success: false,
                error: dashboardResult.error ?? "Unable to load dashboard analytics.",
            });
        }

        const analytics = dashboardResult.data?.storeAnalytics?.[0];

        if (analytics == null) {
            return rejectWithValue({
                success: false,
                error: "Dashboard analytics not found.",
            });
        }

        const data = normalizeDashboardData(analytics, storeResult.data);

        if (data == null) {
            return rejectWithValue({
                success: false,
                error: "Unable to prepare dashboard analytics.",
            });
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const runStoreSeoAuditHandler = createAsyncThunk<
    ApiResponse<unknown>,
    void,
    { rejectValue: RejectError }
>("dashboard/runStoreSeoAudit", async (_, { rejectWithValue }) => {
    try {
        const response = await authFetch("/api/v1/ai/seo-audit/store", {
            method: "GET",
            cache: "no-store",
        });
        const result: ApiResponse<unknown> = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({
                success: false,
                error: result.error ?? "Unable to run SEO audit.",
            });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});
