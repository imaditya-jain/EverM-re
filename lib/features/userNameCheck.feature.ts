import { createAsyncThunk } from "@reduxjs/toolkit";
interface apiResponseTypes {
    success: boolean;
    error: string;
}

export const userNameCheckHandler = createAsyncThunk<apiResponseTypes, string, { rejectValue: string }>('username/check', async (userName, { rejectWithValue }) => {
    try {
        const response = await fetch(`/api/v1/auth/check-username-availability/?userName=${userName}`)
        const {success, error} = await response.json()

        if(error){
            return rejectWithValue(error)
        }

        return success

    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue(error.message)
        }
        return rejectWithValue("Something went wrong.")
    }
})