import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateSeoHandler, getProductDetailHandler, getProductsHandler, saveProductSeoHandler } from "../features/product.feature";

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
    productId?: string;
}

interface RejectError {
    success: boolean;
    error: string;
}

interface InitialStateTypes {
    productsData: any | null;
    productDetailData: any | null;
    loadingProducts: boolean;
    loadingDetail: boolean;
    generatingSeoId: string | null;
    savingSeo: boolean;
    error: string;
    message: string;
}

const initialState: InitialStateTypes = {
    productsData: null,
    productDetailData: null,
    loadingProducts: true,
    loadingDetail: true,
    generatingSeoId: null,
    savingSeo: false,
    error: "",
    message: ""
};

export const productSlice = createSlice({
    name: 'product',
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
        clearProductState: (state) => {
            state.error = "";
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getProductsHandler.pending, (state) => {
            state.loadingProducts = true;
            productSlice.caseReducers.setPending(state);
        });
        builder.addCase(getProductsHandler.fulfilled, (state, action) => {
            state.loadingProducts = false;
            state.productsData = action.payload.data;
            productSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(getProductsHandler.rejected, (state, action) => {
            state.loadingProducts = false;
            state.productsData = null;
            productSlice.caseReducers.setRejected(state, action);
        });

        builder.addCase(getProductDetailHandler.pending, (state) => {
            state.loadingDetail = true;
            productSlice.caseReducers.setPending(state);
        });
        builder.addCase(getProductDetailHandler.fulfilled, (state, action) => {
            state.loadingDetail = false;
            state.productDetailData = action.payload.data;
            productSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(getProductDetailHandler.rejected, (state, action) => {
            state.loadingDetail = false;
            state.productDetailData = null;
            productSlice.caseReducers.setRejected(state, action);
        });

        builder.addCase(generateSeoHandler.pending, (state, action) => {
            state.generatingSeoId = action.meta.arg.productId || 'detail';
            productSlice.caseReducers.setPending(state);
        });
        builder.addCase(generateSeoHandler.fulfilled, (state, action) => {
            state.generatingSeoId = null;
            productSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(generateSeoHandler.rejected, (state, action) => {
            state.generatingSeoId = null;
            productSlice.caseReducers.setRejected(state, action);
        });

        builder.addCase(saveProductSeoHandler.pending, (state) => {
            state.savingSeo = true;
            productSlice.caseReducers.setPending(state);
        });
        builder.addCase(saveProductSeoHandler.fulfilled, (state, action) => {
            state.savingSeo = false;
            productSlice.caseReducers.setFulfilled(state, action);
        });
        builder.addCase(saveProductSeoHandler.rejected, (state, action) => {
            state.savingSeo = false;
            productSlice.caseReducers.setRejected(state, action);
        });
    }
});

export default productSlice.reducer;
export const { clearProductState } = productSlice.actions;