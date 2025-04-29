// src/features/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token,
        isAuthenticated: !!token,
        user,
        loading: false,
        isAdmin: user ? user.email == "avinashb927@gmail.com" : false,
    },
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;

            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        loginFailure: (state) => {
            state.loading = false;
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } =
    authSlice.actions;
export default authSlice.reducer;
