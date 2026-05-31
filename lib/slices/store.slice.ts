import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { disconnectStoreHandler, getStoreStatusHandler, syncProductsHandler } from "../features/store.feature";

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

interface StoreStatus {
    connected: boolean;
    store?: {
        id: string;
        shop: string;
        connectedAt: string;
        totalProducts: number;
        syncedProducts: number;
        syncingProducts: number;
        notSyncedProducts: number;
        failedProducts: number;
        collections: number;
        lastSyncAt: string | null;
    };
}

interface InitialStateTypes {
    status: StoreStatus;
    loading: boolean;
    syncing: boolean;
    disconnecting: boolean;
    error: string;
    message: string;
}

const initialState: InitialStateTypes = {
    status: { connected: false },
    loading: true,
    syncing: false,
    disconnecting: false,
    error: "",
    message: ""
};

export const storeSlice = createSlice({
    name: 'store',
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
        clearStoreState: (state) => {
            state.error = "";
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getStoreStatusHandler.pending, (state) => {
            state.loading = true;
            storeSlice.caseReducers.setPending(state);
        });
        builder.addCase(getStoreStatusHandler.fulfilled, (state, action) => {
            state.loading = false;
            state.status = action.payload.data;
            storeSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(getStoreStatusHandler.rejected, (state, action) => {
            state.loading = false;
            state.status = { connected: false };
            storeSlice.caseReducers.setRejected(state, action);
        });

        builder.addCase(syncProductsHandler.pending, (state) => {
            state.syncing = true;
            storeSlice.caseReducers.setPending(state);
        });
        builder.addCase(syncProductsHandler.fulfilled, (state, action) => {
            state.syncing = false;
            storeSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(syncProductsHandler.rejected, (state, action) => {
            state.syncing = false;
            storeSlice.caseReducers.setRejected(state, action);
        });

        // disconnectStore
        builder.addCase(disconnectStoreHandler.pending, (state) => {
            state.disconnecting = true;
            storeSlice.caseReducers.setPending(state);
        });
        builder.addCase(disconnectStoreHandler.fulfilled, (state, action) => {
            state.disconnecting = false;
            state.status = { connected: false };
            storeSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(disconnectStoreHandler.rejected, (state, action) => {
            state.disconnecting = false;
            storeSlice.caseReducers.setRejected(state, action);
        });
    }
});

export default storeSlice.reducer;
export const { clearStoreState } = storeSlice.actions;
