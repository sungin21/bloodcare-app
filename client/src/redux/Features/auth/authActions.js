import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../services/API";
import { toast } from "react-toastify";

/* ================================
   LOGIN
=================================== */
export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ role, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", { role, email, password });

      if (data.success) {
        toast.success(data.message);
        localStorage.setItem("token", data.token);
        window.location.replace("/");
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

/* ================================
   REGISTER (UPDATED FOR NEW FORM)
=================================== */
export const userRegister = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      phone,
      age,
      pincode,
      bloodGroup,
      password,
      agree,
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        phone,
        age,
        pincode,
        bloodGroup,
        password,
        agree,
      });

      if (data.success) {
        toast.success(data.message || "Registration Successful");
        return data;
      }

      toast.error(data.message || "Registration Failed");
      return rejectWithValue(data.message);
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Registration error";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* ================================
   CURRENT USER
=================================== */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/auth/current-user");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch user"
      );
    }
  }
);
