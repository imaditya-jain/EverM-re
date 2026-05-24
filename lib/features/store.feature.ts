import { authFetch } from "@/app/lib/auth-fetch";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

interface RejectError {
    success: boolean;
    error: string;
}

export const getStoreStatusHandler = createAsyncThunk<ApiResponse, void, { rejectValue: RejectError }>('store/getStatus', async (_, { rejectWithValue }) => {
    try {
        const response = await authFetch('/api/v1/shopify/store', { method: 'GET', cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Something went wrong." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const syncProductsHandler = createAsyncThunk<ApiResponse, void, { rejectValue: RejectError }>('store/syncProducts', async (_, { rejectWithValue }) => {
    try {
        const response = await authFetch('/api/v1/shopify/products/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cursor: null })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to sync products." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const disconnectStoreHandler = createAsyncThunk<ApiResponse, void, { rejectValue: RejectError }>('store/disconnect', async (_, { rejectWithValue }) => {
    try {
        const response = await authFetch('/api/v1/shopify/store', { method: 'DELETE' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to disconnect store." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});
