import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import queryReducer from "./querySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    query: queryReducer,
  },
});
