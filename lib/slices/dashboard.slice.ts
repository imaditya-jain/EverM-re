import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DashboardAnalytics } from "@/types";
import { getDashboardHandler, runStoreSeoAuditHandler } from "../features/dashboard.feature";

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

interface RejectError {
    success: boolean;
    error: string;
}

interface InitialStateTypes {
    dashboardData: DashboardAnalytics | null;
    loading: boolean;
    refreshing: boolean;
    auditing: boolean;
    hasLoadedForSession: boolean;
    error: string;
    message: string;
}

const initialState: InitialStateTypes = {
    dashboardData: null,
    loading: true,
    refreshing: false,
    auditing: false,
    hasLoadedForSession: false,
    error: "",
    message: "",
};

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setPending: (state) => {
            state.error = "";
            state.message = "";
        },
        setFulfilled: (state, action: PayloadAction<ApiResponse>) => {
            state.message = action.payload.message || "";
            state.error = "";
        },
        setRejected: (state, action: PayloadAction<RejectError | undefined>) => {
            state.message = "";
            state.error = action.payload?.error || "Something went wrong.";
        },
        clearDashboardState: (state) => {
            state.error = "";
            state.message = "";
        },
        markDashboardLoadedForSession: (state) => {
            state.hasLoadedForSession = true;
            state.loading = false;
            state.refreshing = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getDashboardHandler.pending, (state) => {
            state.hasLoadedForSession = true;
            state.loading = !state.dashboardData;
            state.refreshing = Boolean(state.dashboardData);
            dashboardSlice.caseReducers.setPending(state);
        });
        builder.addCase(getDashboardHandler.fulfilled, (state, action) => {
            state.loading = false;
            state.refreshing = false;
            state.dashboardData = action.payload.data || null;
            dashboardSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(getDashboardHandler.rejected, (state, action) => {
            state.loading = false;
            state.refreshing = false;
            state.dashboardData = null;
            dashboardSlice.caseReducers.setRejected(state, action);
        });

        builder.addCase(runStoreSeoAuditHandler.pending, (state) => {
            state.auditing = true;
            dashboardSlice.caseReducers.setPending(state);
        });
        builder.addCase(runStoreSeoAuditHandler.fulfilled, (state, action) => {
            state.auditing = false;
            dashboardSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(runStoreSeoAuditHandler.rejected, (state, action) => {
            state.auditing = false;
            dashboardSlice.caseReducers.setRejected(state, action);
        });
    },
});

export default dashboardSlice.reducer;
export const { clearDashboardState, markDashboardLoadedForSession } = dashboardSlice.actions;
