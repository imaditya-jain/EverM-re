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

export const loginUserHandler = createAsyncThunk<ApiResponse, Record<string, unknown>, {rejectValue: RejectError}>('auth/login', async(data, {rejectWithValue})=>{
try {
    const response = await fetch('/api/v1/auth/login', {method:'POST', body: JSON.stringify({...data})})

    const result = await response.json()

    if(!response.ok){
        return rejectWithValue({success: false, error: result.error})
    }

    return result
    
} catch (error) {
    if(error instanceof Error){
        return rejectWithValue({success: false, error: error.message})
    }else{
        return rejectWithValue({success: false, error: 'Something went wrong.'})
    }
}
})
