import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addLeave, setError } from "../../features/leaves/leaveSlice";
import emailjs from "@emailjs/browser";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";

const LeaveForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { leaves } = useSelector((state) => state.leaves);

  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
  });

  // Constants for leave allocation
  const TOTAL_LEAVES = {
    annual: 20,
    sick: 12,
    personal: 5,
  };

  // Constants for leave limits
  const PENDING_LIMITS = {
    annual: 35,
    sick: 27,
    personal: 20,
  };

  // Calculate total leaves taken (approved + pending)
  const calculateTotalLeavesTaken = (type) => {
    return leaves
      .filter(
        (leave) =>
          leave.userId === user.id &&
          leave.leaveType === type &&
          (leave.status === "approved" || leave.status === "pending")
      )
      .reduce((total, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return total + days;
      }, 0);
  };

  // Get remaining leaves before pending
  const getRemainingLeaves = (type) => {
    const totalTaken = calculateTotalLeavesTaken(type);
    return TOTAL_LEAVES[type] - totalTaken;
  };

  // Get remaining leaves before rejection
  const getRemainingBeforeRejection = (type) => {
    const totalTaken = calculateTotalLeavesTaken(type);
    return PENDING_LIMITS[type] - totalTaken;
  };

  // Calculate days between dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
    setFormError("");
  };

  // Send email notification
  const sendEmailNotification = async (leaveData) => {
    try {
      const templateParams = {
        to_name: "HR Manager",
        from_name: user.name,
        from_email: user.email,
        leave_type: leaveData.leaveType,
        start_date: new Date(leaveData.startDate).toLocaleDateString(),
        end_date: new Date(leaveData.endDate).toLocaleDateString(),
        reason: leaveData.reason,
        status: leaveData.status,
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      console.log("Email notification sent successfully");
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't block the leave submission if email fails
    }
  };

  const validateForm = () => {
    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      setFormError("Please fill in all fields");
      return false;
    }

    if (formData.endDate < formData.startDate) {
      setFormError("End date cannot be before start date");
      return false;
    }

    return true;
  };

  const determineLeaveStatus = (leaveType, duration) => {
    const totalTaken = calculateTotalLeavesTaken(leaveType);
    const newTotal = totalTaken + duration;
    const maxAllowed = TOTAL_LEAVES[leaveType];
    const pendingLimit = PENDING_LIMITS[leaveType];

    if (newTotal <= maxAllowed) {
      return {
        status: "approved",
        message: "Leave request approved automatically!",
      };
    } else if (newTotal <= pendingLimit) {
      return {
        status: "pending",
        message: `Leave request pending: Total days (${newTotal}) exceeds standard limit of ${maxAllowed} days`,
      };
    } else {
      return {
        status: "rejected",
        message: `Leave request rejected: Total days (${newTotal}) exceeds maximum allowed limit of ${pendingLimit} days`,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setShowError(true);
      return;
    }

    const leaveDuration = calculateDays(formData.startDate, formData.endDate);
    const { status, message } = determineLeaveStatus(
      formData.leaveType,
      leaveDuration
    );

    const newLeave = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      ...formData,
      status: status,
      requestedDays: leaveDuration,
    };

    try {
      dispatch(addLeave(newLeave));
      setStatusMessage(message);

      if (status === "rejected") {
        setShowError(true);
      } else {
        setShowSuccess(true);
        // Reset form
        setFormData({
          leaveType: "",
          startDate: null,
          endDate: null,
          reason: "",
        });

        // Send email notification
        await sendEmailNotification(newLeave);

        // Navigate to leaves list after a delay
        setTimeout(() => {
          navigate("/leaves");
        }, 2000);
      }
    } catch (error) {
      dispatch(setError("Failed to submit leave request"));
      setStatusMessage(error.message);
      setShowError(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    setShowError(false);
  };

  const leaveTypes = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "personal", label: "Personal Leave" },
  ];

  const userGuide = (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          <Typography>User Guide - Leave Request</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Leave Types and Limits"
              secondary={
                <Box component="span" sx={{ display: "block", mt: 1 }}>
                  • Annual Leave: Up to 20 days (auto-approved), 21-34 days
                  (pending), 35+ days (rejected)
                  <br />
                  • Sick Leave: Up to 12 days (auto-approved), 13-26 days
                  (pending), 27+ days (rejected)
                  <br />• Personal Leave: Requires manual approval
                </Box>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Auto-Approval"
              secondary="Leaves within standard limits are automatically approved"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <WarningIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Pending Status"
              secondary="Requests exceeding standard limits but within extended limits require review"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BlockIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Automatic Rejection"
              secondary="Requests exceeding maximum limits are automatically rejected"
            />
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Request Leave
        </Typography>

        {userGuide}

        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}

        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {statusMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveType}
                label="Leave Type"
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
                size={isMobile ? "small" : "medium"}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 2,
                }}
              >
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) =>
                    setFormData({ ...formData, startDate: date })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                  minDate={new Date()}
                />
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) =>
                    setFormData({ ...formData, endDate: date })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                  minDate={formData.startDate || new Date()}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              size={isMobile ? "small" : "medium"}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
            >
              Submit Request
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {statusMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {statusMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeaveForm;
