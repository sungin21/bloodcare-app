// src/services/authService.js
import { userLogin, userRegister } from "../redux/Features/auth/authActions";
import store from "../redux/store";
import { toast } from "react-toastify";

/* Helper to detect legacy event calls */
const isEvent = (x) => x && typeof x.preventDefault === "function";

/* ======================================================
   LOGIN — supports old syntax and new object syntax
====================================================== */
export const handleLogin = async (a, b, c, d) => {
  try {
    let payload = {};

    if (isEvent(a)) {
      // Old usage: handleLogin(e, email, password, role)
      const e = a;
      e.preventDefault();

      payload = { email: b, password: c, role: d };
    } else {
      // New usage: handleLogin({ email, password, role })
      payload = a;
    }

    if (!payload.email || !payload.password || !payload.role) {
      toast.error("Please fill all fields");
      return null;
    }

    const response = await store.dispatch(userLogin(payload));
    return response.payload ?? null;
  } catch (err) {
    console.error("Login Error:", err);
    toast.error("Login failed");
    return null;
  }
};

/* ======================================================
   REGISTER — NEW version for your new form structure
   Supports:
   1) handleRegister(e) → legacy call
   2) handleRegister({ name, email, age, pincode, ... })
====================================================== */
export const handleRegister = async (a, ...rest) => {
  try {
    let payload = {};

    if (isEvent(a)) {
      // ❌ YOU WILL NOT USE THIS ANYMORE — but supported for safety
      const e = a;
      e.preventDefault();

      payload = {
        name: rest[0],
        email: rest[1],
        phone: rest[2],
        age: rest[3],
        pincode: rest[4],
        bloodGroup: rest[5],
        password: rest[6],
        agree: rest[7],
      };
    } else {
      // ✅ NEW USAGE — clean and recommended
      payload = {
        name: a.name,
        email: a.email,
        phone: a.phone,
        age: a.age,
        pincode: a.pincode,
        bloodGroup: a.bloodGroup,
        password: a.password,
        agree: a.agree,
      };
    }

    // Dispatch Redux thunk
    const response = await store.dispatch(userRegister(payload));
    return response.payload ?? null;
  } catch (error) {
    console.error("Register Error:", error);
    toast.error("Registration failed");
    return null;
  }
};
