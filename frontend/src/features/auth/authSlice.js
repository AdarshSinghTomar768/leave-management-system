import { createSlice } from "@reduxjs/toolkit";

// Get user data from localStorage
const getUserFromStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get registered users from localStorage
const getRegisteredUsers = () => {
  const users = localStorage.getItem("registeredUsers");
  return users
    ? JSON.parse(users)
    : [
        {
          email: "demo@example.com",
          password: "demo123",
          name: "Demo User",
          role: "employee",
          department: "IT",
          phoneNumber: "1234567890",
          profilePic: "",
          leaves: {
            annual: 20,
            sick: 10,
            personal: 5,
          },
        },
      ];
};

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  registeredUsers: getRegisteredUsers(),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // Find the user in registeredUsers to get their complete profile
      const userProfile = state.registeredUsers.find(
        (u) => u.email === action.payload.email
      );

      if (userProfile) {
        state.user = userProfile;
        state.isAuthenticated = true;
        state.error = null;
        // Store complete user profile in localStorage
        localStorage.setItem("user", JSON.stringify(userProfile));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
    registerUser: (state, action) => {
      const newUser = {
        ...action.payload,
        phoneNumber: action.payload.phoneNumber || "",
        leaves: {
          annual: 20,
          sick: 10,
          personal: 5,
        },
      };
      state.registeredUsers.push(newUser);
      // Update registered users in localStorage
      localStorage.setItem(
        "registeredUsers",
        JSON.stringify(state.registeredUsers)
      );
      // Automatically log in the new user
      state.user = newUser;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(newUser));
    },
    updateProfile: (state, action) => {
      // Update the current user's profile
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;

      // Update user in registeredUsers array
      const userIndex = state.registeredUsers.findIndex(
        (u) => u.email === updatedUser.email
      );
      if (userIndex !== -1) {
        // Preserve the password and leaves data when updating
        const existingUser = state.registeredUsers[userIndex];
        state.registeredUsers[userIndex] = {
          ...existingUser,
          ...action.payload,
          password: existingUser.password, // Keep the existing password
          leaves: existingUser.leaves, // Keep the existing leaves data
        };
      }

      // Update both in localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem(
        "registeredUsers",
        JSON.stringify(state.registeredUsers)
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, logout, registerUser, updateProfile, setError } =
  authSlice.actions;
export default authSlice.reducer;
