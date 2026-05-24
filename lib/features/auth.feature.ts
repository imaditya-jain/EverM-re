import { User } from "@/types";
import { authFetch } from "@/app/lib/auth-fetch";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        user: User
    }
}

interface RejectError {
    success: boolean,
    error: string
}

export const userRegistrationHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/register', async (data, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data }) })

        const result: ApiResponse = await response.json()

        if (!response.ok) {
            return rejectWithValue({
                success: false,
                error: result?.error || "Something went wrong."
            })
        }

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({
                success: false,
                error: error.message
            })
        }

        return rejectWithValue({
            success: false,
            error: 'Something went wrong.'
        })
    }
})

export const verifyUserHandler = createAsyncThunk<ApiResponse, string, { rejectValue: RejectError }>('auth/verify-user', async (token, { rejectWithValue }) => {
    try {
        const response = await fetch(`/api/v1/auth/verify-user/?token=${token}`, { method: "GET" })

        const result: ApiResponse = await response.json()

        if (!response.ok) {
            return rejectWithValue({ success: false, error: result?.error || "Something went wrong." })
        }

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        }

        return rejectWithValue({ success: false, error: "Something went wrong." })
    }
})

export const loginUserHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/login', async (data, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data }) })

        const result = await response.json()

        if (!response.ok) {
            return rejectWithValue({ success: false, error: result.error })
        }

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        } else {
            return rejectWithValue({ success: false, error: 'Something went wrong.' })
        }
    }
})

export const forgotPasswordHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/forgot-password', async (data, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/v1/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data }) })

        const result = await response.json()

        if (!response.ok) {
            return rejectWithValue({ success: false, error: result.error })
        }

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        }

        return rejectWithValue({ success: false, error: 'Something went wrong.' })
    }
})

export const resetPasswordHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/reset-password', async (data, { rejectWithValue }) => {
    try {
        const response = await fetch(`/api/v1/auth/reset-password/?token=${data.token}`, { method: "PATCH", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: data.password }) })

        const result = await response.json()

        if (!response.ok) {
            return rejectWithValue({ success: false, error: result?.error })
        }

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        } else {
            return rejectWithValue({ success: false, error: 'Something went wrong.' })
        }
    }
})

export const getCurrentUserHandler = createAsyncThunk<ApiResponse, void, { rejectValue: RejectError }>('auth/me', async (_, { rejectWithValue }) => {
    try {

        const response = await authFetch('/api/v1/auth/me', { method: 'GET' })

        const result = await response.json()

        if (!response.ok) return rejectWithValue({ success: false, error: result?.error })

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        } else {
            return rejectWithValue({ success: false, error: "Something went wrong." })
        }

    }
})

export const refreshTokenHandler = createAsyncThunk<ApiResponse, void, { rejectValue: RejectError }>('auth/refresh-token', async (_, { rejectWithValue }) => {
    try {

        const response = await fetch('/api/v1/auth/refresh-token', { method: 'POST' })

        const result = await response.json()

        if (!response.ok) return rejectWithValue({ success: false, error: result?.error })

        return result

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        } else {
            return rejectWithValue({ success: false, error: "Something went wrong." })
        }
    }
})

export const logoutUserHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/logout', async (_, { rejectWithValue }) => {
    try {

        const response = await fetch('/api/v1/auth/logout', { method: 'POST' })

        const result = await response.json()

        if (!response.ok) return rejectWithValue({ success: false, error: result?.error })

        return result

    } catch (error) {

        if (error instanceof Error) {
            return rejectWithValue({ success: false, error: error.message })
        } else {
            return rejectWithValue({ success: false, error: "Something went wrong" })
        }

    }
})

export const initializeAuthSessionHandler = createAsyncThunk<
    ApiResponse,
    void,
    { rejectValue: RejectError }
>(
    'auth/initialize-session',
    async (_, { rejectWithValue, dispatch }) => {
        try {

            const meResult = await dispatch(
                getCurrentUserHandler()
            ).unwrap()

            return meResult

        } catch {
            try {
                await dispatch(refreshTokenHandler()).unwrap()
                const meAfterRefresh = await dispatch(getCurrentUserHandler()).unwrap()
                return meAfterRefresh
            } catch {
                return rejectWithValue({
                    success: false,
                    error: "Session not found.",
                })
            }
        }
    }
)
