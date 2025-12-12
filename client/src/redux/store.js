import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/auth/authSlice";
import requestReducer from "./Features/request/requestSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestReducer,
  },
});

export default store;
