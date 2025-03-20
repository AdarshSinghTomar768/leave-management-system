import { createSlice } from "@reduxjs/toolkit";

// Helper function to calculate days between dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Constants for leave allocation and limits
const TOTAL_LEAVES = {
  annual: 20,
  sick: 12,
  personal: 5,
};

const PENDING_LIMITS = {
  annual: 35,
  sick: 27,
  personal: 20,
};

// Helper function to calculate total leaves taken (approved + pending)
const calculateTotalLeavesTaken = (leaves, leaveType, userId) => {
  return leaves.reduce((acc, leave) => {
    if (
      leave.userId === userId &&
      leave.leaveType === leaveType &&
      (leave.status === "approved" || leave.status === "pending")
    ) {
      return acc + calculateDays(leave.startDate, leave.endDate);
    }
    return acc;
  }, 0);
};

// Helper function to determine leave status
const determineLeaveStatus = (leaveType, totalDaysTaken) => {
  switch (leaveType.toLowerCase()) {
    case "annual":
      if (totalDaysTaken <= 20) return "approved";
      if (totalDaysTaken > 20 && totalDaysTaken < 35) return "pending";
      return "rejected";
    case "sick":
      if (totalDaysTaken <= 12) return "approved";
      if (totalDaysTaken > 12 && totalDaysTaken < 27) return "pending";
      return "rejected";
    default:
      return "pending";
  }
};

// Get leaves from localStorage
const getStoredLeaves = () => {
  try {
    const storedLeaves = localStorage.getItem("leaves");
    return storedLeaves ? JSON.parse(storedLeaves) : [];
  } catch (error) {
    console.error("Error parsing leaves from localStorage:", error);
    return [];
  }
};

const initialState = {
  leaves: getStoredLeaves(),
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    addLeave: (state, action) => {
      const { userId, leaveType, startDate, endDate } = action.payload;

      // Calculate days for current request
      const requestedDays = calculateDays(startDate, endDate);

      // Calculate total leaves taken for this type including current request
      const totalLeavesTaken =
        calculateTotalLeavesTaken(state.leaves, leaveType, userId) +
        requestedDays;

      // Determine status based on total leaves
      const status = determineLeaveStatus(leaveType, totalLeavesTaken);

      const newLeave = {
        id: Date.now().toString(),
        userId,
        leaveType,
        startDate,
        endDate,
        reason: action.payload.reason,
        status,
        createdAt: new Date().toISOString(),
      };

      state.leaves.push(newLeave);
      localStorage.setItem("leaves", JSON.stringify(state.leaves));
    },
    updateLeaveStatus: (state, action) => {
      const { leaveId, status, reason } = action.payload;
      const leaveIndex = state.leaves.findIndex(
        (leave) => leave.id === leaveId
      );

      if (leaveIndex !== -1) {
        state.leaves[leaveIndex].status = status;
        if (reason) {
          if (status === "rejected") {
            state.leaves[leaveIndex].rejectionReason = reason;
          } else {
            state.leaves[leaveIndex].pendingReason = reason;
          }
        }
        localStorage.setItem("leaves", JSON.stringify(state.leaves));
      }
    },
    deleteLeave: (state, action) => {
      state.leaves = state.leaves.filter(
        (leave) => leave.id !== action.payload
      );
      localStorage.setItem("leaves", JSON.stringify(state.leaves));
    },
    editLeave: (state, action) => {
      const { id, leaveType, startDate, endDate, reason } = action.payload;
      const leaveIndex = state.leaves.findIndex((leave) => leave.id === id);

      if (leaveIndex !== -1) {
        const userId = state.leaves[leaveIndex].userId;

        // Remove current leave from total calculation
        const currentLeaveDays = calculateDays(
          state.leaves[leaveIndex].startDate,
          state.leaves[leaveIndex].endDate
        );

        // Calculate new requested days
        const newRequestedDays = calculateDays(startDate, endDate);

        // Calculate total leaves excluding current leave
        const totalLeavesTaken =
          calculateTotalLeavesTaken(
            state.leaves.filter((leave) => leave.id !== id),
            userId,
            leaveType
          ) + newRequestedDays;

        // Determine new status based on updated total
        const status = determineLeaveStatus(leaveType, totalLeavesTaken);

        state.leaves[leaveIndex] = {
          ...state.leaves[leaveIndex],
          leaveType,
          startDate,
          endDate,
          reason,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    setLeaves: (state, action) => {
      state.leaves = action.payload;
      localStorage.setItem("leaves", JSON.stringify(state.leaves));
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addLeave,
  updateLeaveStatus,
  deleteLeave,
  editLeave,
  setLeaves,
  setError,
} = leaveSlice.actions;

export default leaveSlice.reducer;
