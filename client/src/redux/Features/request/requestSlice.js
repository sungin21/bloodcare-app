import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: {
    loading: false,
    incoming: [],   // requests coming TO donor
    error: null,
  },

  reducers: {
    requestStart(state) {
      state.loading = true;
    },
    requestSuccess(state, action) {
      state.loading = false;
      state.incoming = action.payload;
      state.error = null;
    },
    requestFail(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update status instantly in UI
    updateRequestStatus(state, action) {
      const { id, status } = action.payload;
      state.incoming = state.incoming.map((req) =>
        req._id === id ? { ...req, status } : req
      );
    },
  },
});

export const {
  requestStart,
  requestSuccess,
  requestFail,
  updateRequestStatus,
} = requestSlice.actions;

export default requestSlice.reducer;
