import { createSlice } from "@reduxjs/toolkit";
import { getCurrentUser, userLogin, userRegister } from "./authActions";

const token = localStorage.getItem("token") ? localStorage.getItem("token") : null;

const initialState = {
  loading: false,
  user: null,
  token,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  // ✅ ADD setUser here
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },
  },

  extraReducers: (builder) => {
    // LOGIN
    builder.addCase(userLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userLogin.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (payload) {
        state.user = payload.user || null;
        state.token = payload.token || null;
      }
    });
    builder.addCase(userLogin.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload || "Login failed";
    });

    // REGISTER
    builder.addCase(userRegister.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userRegister.fulfilled, (state, { payload }) => {
  state.loading = false;
  // keep user null on purpose (user should login after register)
  state.user = null;
});

    builder.addCase(userRegister.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload || "Registration failed";
    });

    // CURRENT USER
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload?.user || null;
    });
    builder.addCase(getCurrentUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload || "Unable to fetch user";
    });
  },
});

// ✅ EXPORT setUser properly
export const { setUser } = authSlice.actions;

export default authSlice.reducer;
