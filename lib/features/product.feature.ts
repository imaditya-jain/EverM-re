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

export const getProductsHandler = createAsyncThunk<ApiResponse, string, { rejectValue: RejectError }>('product/getProducts', async (queryString, { rejectWithValue }) => {
    try {
        const response = await authFetch(`/api/v1/shopify/products?${queryString}`, { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to load products." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const getProductDetailHandler = createAsyncThunk<ApiResponse, string, { rejectValue: RejectError }>('product/getProductDetail', async (id, { rejectWithValue }) => {
    try {
        const response = await authFetch(`/api/v1/shopify/products/${id}`, { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to load product." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const generateSeoHandler = createAsyncThunk<ApiResponse, { title: string; description: string; productId?: string }, { rejectValue: RejectError }>('product/generateSeo', async (data, { rejectWithValue }) => {
    try {
        const response = await authFetch('/api/v1/ai/generate-seo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: data.title,
                description: data.description
            })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to generate SEO." });
        }

        return { ...result, productId: data.productId }; // Pass productId to reducer if needed
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});

export const saveProductSeoHandler = createAsyncThunk<ApiResponse, { id: string; seoTitle: string; seoDescription: string }, { rejectValue: RejectError }>('product/saveSeo', async (data, { rejectWithValue }) => {
    try {
        const response = await authFetch(`/api/v1/shopify/products/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription
            })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            return rejectWithValue({ success: false, error: result?.error || "Unable to save SEO." });
        }

        return result;
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message });
        }
        return rejectWithValue({ success: false, error: "Something went wrong." });
    }
});
