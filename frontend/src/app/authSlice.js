import { createSlice } from "@reduxjs/toolkit";

const initialToken = localStorage.getItem("token");
const initialUser = JSON.parse(localStorage.getItem("user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialToken,
    user: initialUser,
    isAuthenticated: Boolean(initialToken),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, email, roles } = action.payload;
      state.token = token;
      state.user = { email, roles };
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email, roles }));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
