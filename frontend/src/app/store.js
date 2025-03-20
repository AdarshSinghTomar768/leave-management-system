import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import leaveReducer from "../features/leaves/leaveSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leaveReducer,
  },
});
