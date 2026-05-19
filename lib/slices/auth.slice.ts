import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";
import { forgotPasswordHandler, getCurrentUserHandler, initializeAuthSessionHandler, loginUserHandler, logoutUserHandler, refreshTokenHandler, resetPasswordHandler, userRegistrationHandler, verifyUserHandler } from "../features/auth.feature";

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
    isAuthenticated: boolean;
    initialized: boolean;
}

const initialState: InitialStateTypes = {
    user: null,
    loading: false,
    error: "",
    message: "",
    isAuthenticated: false,
    initialized: false
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
        },
        clearAuthState: (state) => {
            state.error = ""
            state.message = ""
        }
    },
    extraReducers: (builder) => {
        builder.addCase(userRegistrationHandler.pending, (state) => authSlice.caseReducers.setPending(state));
        builder.addCase(userRegistrationHandler.fulfilled, (state, action) => authSlice.caseReducers.setFulfilled(state, action));
        builder.addCase(userRegistrationHandler.rejected, (state, action) => authSlice.caseReducers.setRejected(state, action))

        builder.addCase(verifyUserHandler.pending, (state) => authSlice.caseReducers.setPending(state))
        builder.addCase(verifyUserHandler.fulfilled, (state, action) => {
            authSlice.caseReducers.setFulfilled(state, action)
            state.isAuthenticated = true;
            state.initialized = true
            state.user = action.payload?.data?.user || null
        })
        builder.addCase(verifyUserHandler.rejected, (state, action) =>{
             authSlice.caseReducers.setRejected(state, action)
             state.initialized = true;
             state.isAuthenticated = false;
             state.user = null
        })

        builder.addCase(loginUserHandler.pending, (state) => authSlice.caseReducers.setPending(state))
        builder.addCase(loginUserHandler.fulfilled, (state, action) => {
            authSlice.caseReducers.setFulfilled(state, action)
            state.isAuthenticated = true;
            state.initialized = true
            state.user = action.payload?.data?.user || null
        })
        builder.addCase(loginUserHandler.rejected, (state, action) => {
            authSlice.caseReducers.setRejected(state, action)
            state.user = null;
            state.initialized = true;
            state.isAuthenticated = false
        })

        builder.addCase(forgotPasswordHandler.pending, (state) => authSlice.caseReducers.setPending(state))
        builder.addCase(forgotPasswordHandler.fulfilled, (state, action) => authSlice.caseReducers.setFulfilled(state, action))
        builder.addCase(forgotPasswordHandler.rejected, (state, action) => authSlice.caseReducers.setRejected(state, action))

        builder.addCase(resetPasswordHandler.pending, (state) => authSlice.caseReducers.setPending(state))
        builder.addCase(resetPasswordHandler.fulfilled, (state, action) => authSlice.caseReducers.setFulfilled(state, action))
        builder.addCase(resetPasswordHandler.rejected, (state, action) => authSlice.caseReducers.setRejected(state, action))

        builder.addCase(logoutUserHandler.pending, (state) => authSlice.caseReducers.setPending(state))
        builder.addCase(logoutUserHandler.fulfilled, (state, action) => {
            authSlice.caseReducers.setFulfilled(state, action)
            state.user = null;
            state.initialized = true;
            state.isAuthenticated = false
        })
        builder.addCase(logoutUserHandler.rejected, (state, action) => {
            authSlice.caseReducers.setRejected(state, action)
            state.user = null;
            state.initialized = true;
            state.isAuthenticated = false
        })

        builder.addCase(getCurrentUserHandler.pending, (state)=>{
            authSlice.caseReducers.setPending(state)
        })
        builder.addCase(getCurrentUserHandler.fulfilled, (state, action)=> {
            authSlice.caseReducers.setFulfilled(state, action)
            state.initialized = true;
            state.isAuthenticated = true;
            state.user = action?.payload?.data?.user || null;
        })
        builder.addCase(getCurrentUserHandler.rejected, (state, action)=>{
            authSlice.caseReducers.setRejected(state, action);
            state.initialized = true;
            state.isAuthenticated = false;
            state.user = null
        })

        builder.addCase(refreshTokenHandler.pending,(state)=> authSlice.caseReducers.setPending(state))
        builder.addCase(refreshTokenHandler.fulfilled, (state, action)=>authSlice.caseReducers.setFulfilled(state, action))
        builder.addCase(refreshTokenHandler.rejected, (state, action)=>authSlice.caseReducers.setRejected(state, action))

        builder.addCase(initializeAuthSessionHandler.pending, (state)=> {
            authSlice.caseReducers.setPending(state);
            state.initialized = false
        })
        builder.addCase(initializeAuthSessionHandler.fulfilled, (state, action)=> {
            authSlice.caseReducers.setFulfilled(state, action);
            state.initialized = true;
            state.isAuthenticated = true;
            state.user = action.payload?.data?.user || null;
        })
        builder.addCase(initializeAuthSessionHandler.rejected, (state, action)=> {
            authSlice.caseReducers.setRejected(state, action);
            state.initialized = true;
            state.isAuthenticated = false;
            state.user = null;
        })
    }
})

export default authSlice.reducer
export const {clearAuthState} = authSlice.actions