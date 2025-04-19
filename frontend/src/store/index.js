import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import trackerReducer from "../features/trackerSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tracker: trackerReducer,
    },
});
