import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";
import { loginUserHandler, userRegistrationHandler, verifyUserHandler } from "../features/auth.feature";

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

interface AuthData {
    user: User;
}

interface RejectError {
    success: boolean;
    error: string;
}

interface InitialStateTypes {
    user: User | null;
    loading: boolean;
    error: string;
    message: string;
}

const initialState: InitialStateTypes = {
    user: null,
    loading: false,
    error: "",
    message: ""
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setPending: (state: InitialStateTypes) => {
            state.loading = true;
            state.error = "";
            state.message = ""
        },

        setFulfilled: (state: InitialStateTypes, action: PayloadAction<ApiResponse<AuthData>>) => {
            state.loading = false;
            state.message = action.payload.message || "";
            state.error = ""
        },

        setRejected: (state: InitialStateTypes, action: PayloadAction<RejectError | undefined>) => {
            state.loading = false;
            state.message = "";
            state.error = action.payload?.error || "Something went wrong."
        }
    },
    extraReducers: (builder) => {
        builder.addCase(userRegistrationHandler.pending, (state) => authSlice.caseReducers.setPending(state));
        builder.addCase(userRegistrationHandler.fulfilled, (state, action)=>authSlice.caseReducers.setFulfilled(state, action));
        builder.addCase(userRegistrationHandler.rejected, (state, action)=>authSlice.caseReducers.setRejected(state, action))

        builder.addCase(verifyUserHandler.pending, (state)=> authSlice.caseReducers.setPending(state))
        builder.addCase(verifyUserHandler.fulfilled, (state, action)=> authSlice.caseReducers.setFulfilled(state, action))
        builder.addCase(verifyUserHandler.rejected, (state, action)=> authSlice.caseReducers.setRejected(state, action))

        builder.addCase(loginUserHandler.pending, (state)=> authSlice.caseReducers.setPending(state))
        builder.addCase(loginUserHandler.fulfilled, (state, action)=> authSlice.caseReducers.setFulfilled(state, action))
        builder.addCase(loginUserHandler.rejected, (state, action)=> authSlice.caseReducers.setRejected(state, action))
    }
})

export default authSlice.reducer