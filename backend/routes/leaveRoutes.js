const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @desc    Create new leave request
// @route   POST /api/leaves
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const user = await User.findById(req.user._id);

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    if (days > user.leaveBalance) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    const leave = new Leave({
      employee: req.user._id,
      type,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all leaves for a user
// @route   GET /api/leaves/my-leaves
// @access  Private
router.get("/my-leaves", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("employee", "name email department")
      .sort("-createdAt");
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all leaves (for managers and admins)
// @route   GET /api/leaves
// @access  Private/Manager/Admin
router.get("/", protect, authorize("manager", "admin"), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email department")
      .sort("-createdAt");
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get leaves by department (for managers)
// @route   GET /api/leaves/department
// @access  Private/Manager
router.get("/department", protect, authorize("manager"), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email department")
      .sort("-createdAt");

    const departmentLeaves = leaves.filter(
      (leave) => leave.employee.department === req.user.department
    );

    res.json(departmentLeaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private/Manager/Admin
router.put(
  "/:id/status",
  protect,
  authorize("manager", "admin"),
  async (req, res) => {
    try {
      const { status, comments } = req.body;
      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if manager is from the same department
      if (
        req.user.role === "manager" &&
        leave.employee.department !== req.user.department
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this leave request" });
      }

      leave.status = status;
      if (comments) {
        leave.comments.push({
          text: comments,
          user: req.user._id,
        });
      }

      await leave.save();
      res.json(leave);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @desc    Add comment to leave request
// @route   POST /api/leaves/:id/comments
// @access  Private
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { comment } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check if user is authorized to comment
    if (
      leave.employee.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      (req.user.role !== "manager" ||
        leave.employee.department !== req.user.department)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to comment on this leave request" });
    }

    leave.comments.push({
      text: comment,
      user: req.user._id,
    });

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Only allow users to delete their own leaves or admins to delete any leave
    if (
      leave.employee.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this leave request" });
    }

    // Only allow deletion of pending leaves
    if (leave.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only delete pending leave requests" });
    }

    await Leave.deleteOne({ _id: req.params.id });
    res.json({
      message: "Leave request deleted successfully",
      _id: req.params.id,
    });
  } catch (error) {
    console.error("Delete leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
