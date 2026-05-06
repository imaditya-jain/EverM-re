import { createSlice } from "@reduxjs/toolkit"

import { userNameCheckHandler } from "../features/userNameCheck.feature"

export interface ApiResponseTypes {
  loading: boolean
  success: boolean
  error: string
  hasChecked: boolean
}

const initialState: ApiResponseTypes =
{
  loading: false,
  success: false,
  error: "",
  hasChecked: false,
}

const userNameCheckSlice =
  createSlice({
    name: "username",

    initialState,

    reducers: {
      resetUserNameCheckState: (state) => {
        state.loading = false
        state.success = false
        state.error = ""
        state.hasChecked = false
      },
    },

    extraReducers: (builder) => {
      builder

        .addCase(
          userNameCheckHandler.pending,
          (state) => {
            state.loading = true
            state.success = false
            state.error = ""
            state.hasChecked = false
          }
        )

        .addCase(
          userNameCheckHandler.fulfilled,
          (state) => {
            state.loading = false
            state.success = true
            state.error = ""
            state.hasChecked = true
          }
        )

        .addCase(
          userNameCheckHandler.rejected,
          (state, action) => {
            state.loading = false
            state.success = false
            state.hasChecked = true
            state.error =
              action.payload ||
              "Something went wrong."
          }
        )
    },
  })

export const { resetUserNameCheckState } = userNameCheckSlice.actions
export default userNameCheckSlice.reducer
