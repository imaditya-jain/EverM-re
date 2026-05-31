export interface User{
    _id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phone: string;
    isVerified: boolean;
}

export type DashboardStore = {
    id: string;
    shop: string;
    connectedAt: string;
    lastSyncAt: string | null;
};

export type DashboardAnalytics = {
    store: DashboardStore;
    total_products: number;
    audited_products: number;
    audit_completed_products: number;
    audit_failed_products: number;
    store_seo_score: number;
    high_priority_products: number;
    medium_priority_products: number;
    low_priority_products: number;
};

export type DashboardApiStats = {
    total_products: number;
    audited_products: number;
    audit_completed_products: number;
    audit_failed_products: number;
    store_seo_score: number;
    high_priority_products: number;
    medium_priority_products: number;
    low_priority_products: number;
};

export type DashboardApiResponse = {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        storeAnalytics: DashboardApiStats[];
    };
};

export type DashboardStoreStatusResponse = {
    success: boolean;
    error?: string;
    data?: {
        connected: boolean;
        store?: {
            id: string;
            shop: string;
            connectedAt: string;
            lastSyncAt: string | null;
        };
    };
};
