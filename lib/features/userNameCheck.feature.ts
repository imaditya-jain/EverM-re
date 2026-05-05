import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { setPending, setFulfilled, setRejected } from "../slices/username-check.slice";

interface apiResponseTypes{
    success: boolean;
    error: string;
    status: number;
}

// export const userNameCheckHandler = createAsyncThunk('username-check', async({}))