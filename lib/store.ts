import { configureStore } from '@reduxjs/toolkit'
import userNameCheckReducer from './slices/username-check.slice'
import authReducer from './slices/auth.slice'
import storeReducer from './slices/store.slice'
import productReducer from './slices/product.slice'
import dashboardReducer from './slices/dashboard.slice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      userNameCheck: userNameCheckReducer,
      auth: authReducer,
      store: storeReducer,
      product: productReducer,
      dashboard: dashboardReducer
    },
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
