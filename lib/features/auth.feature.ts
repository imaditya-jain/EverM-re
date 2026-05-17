import { User } from "@/types";
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
        const response = await fetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ ...data }) })

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
        const response = await fetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ ...data }) })

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
        const response = await fetch('/api/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ ...data }) })

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
        const response = await fetch(`/api/v1/auth/reset-password/?token=${data.token}`, { method: "PATCH", body: JSON.stringify({ password: data.password }) })

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

export const getCurrentUserHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/me', async (_, { rejectWithValue }) => {
    try {

        const response = await fetch('/api/v1/auth/me', { method: 'GET' })

        const result = await response.json()

        if (!response.ok) rejectWithValue({ success: false, error: result?.error })

        return result

    } catch (error) {
        if (error instanceof Error) {
            rejectWithValue({ success: false, error: error.message })
        } else {
            rejectWithValue({ success: false, error: "Something went wrong." })
        }

    }
})

export const refreshTokenHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, { rejectValue: RejectError }>('auth/refresh-token', async (_, { rejectWithValue }) => {
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

        const response = await fetch('/api/v1/auth/logout',{method:'POST'})

        const result = await response.json()

        if(!response.ok) return rejectWithValue({success: false, error: result?.error})

        return result

    } catch (error) {
        
        if(error instanceof Error){
            return rejectWithValue({success: false, error: error.message})
        }else{
            return rejectWithValue({success: false, error:"Something went wrong"})
        }

    }
})

