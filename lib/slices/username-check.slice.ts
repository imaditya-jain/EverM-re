import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface apiResponseTypes {
    loading: boolean;
    success: boolean;
    error: string
}

const initialState: apiResponseTypes = {
    loading: false,
    success: false,
    error: ""
}

const userNameCheckSlice = createSlice({
    name: 'username-check',
    initialState,
    reducers: {
        setPending: (state: apiResponseTypes) => {
            state.loading = true;
            state.success = false;
            state.error = ""
        },
        setFulfilled: (state: apiResponseTypes) => {
            state.loading = false;
            state.success = true;
            state.error = ""
        },
        setRejected: (state: apiResponseTypes, action:PayloadAction<string>) =>{
            state.loading = false;
            state.success = false;
            state.error = action.payload
        }
    }
})

export const {setPending, setFulfilled, setRejected} = userNameCheckSlice.actions