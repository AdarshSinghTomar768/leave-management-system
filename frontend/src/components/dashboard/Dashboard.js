import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday,
  EventNote,
  Person,
  CheckCircle,
  PendingActions,
  Block,
} from "@mui/icons-material";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { leaves = [] } = useSelector((state) => state.leaves);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // If user is not available, show loading
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Constants for leave allocation
  const TOTAL_ANNUAL_LEAVES = 20;
  const TOTAL_SICK_LEAVES = 12;
  const TOTAL_PERSONAL_LEAVES = 5;

  // Calculate used leaves by counting the number of days between start and end dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  // Calculate used leaves for each type
  const usedLeaves = leaves.reduce(
    (acc, leave) => {
      if (leave.status === "approved") {
        const daysCount = calculateDays(leave.startDate, leave.endDate);
        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + daysCount;
      }
      return acc;
    },
    {
      annual: 0,
      sick: 0,
      personal: 0,
    }
  );

  // Calculate remaining leaves
  const remainingLeaves = {
    annual: TOTAL_ANNUAL_LEAVES - usedLeaves.annual,
    sick: TOTAL_SICK_LEAVES - usedLeaves.sick,
    personal: TOTAL_PERSONAL_LEAVES - usedLeaves.personal,
  };

  // Calculate pending leaves
  const pendingLeaves = leaves
    .filter((leave) => leave.status === "pending")
    .reduce(
      (acc, leave) => {
        const daysCount = calculateDays(leave.startDate, leave.endDate);
        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + daysCount;
        return acc;
      },
      {
        annual: 0,
        sick: 0,
        personal: 0,
      }
    );

  const stats = [
    {
      title: "Total Leave Balance",
      value:
        remainingLeaves.annual +
        remainingLeaves.sick +
        remainingLeaves.personal,
      icon: CalendarToday,
      color: "#1976d2",
      description: "Total remaining leave days across all types",
    },
    {
      title: "Pending Leave Days",
      value: Object.values(pendingLeaves).reduce((a, b) => a + b, 0),
      icon: PendingActions,
      color: "#ff9800",
      description: "Total days of leave awaiting approval",
    },
    {
      title: "Total Days Taken",
      value: Object.values(usedLeaves).reduce((a, b) => a + b, 0),
      icon: CheckCircle,
      color: "#4caf50",
      description: "Total days of approved leave taken",
    },
  ];

  const leaveTypes = [
    {
      type: "Annual Leave",
      total: TOTAL_ANNUAL_LEAVES,
      used: usedLeaves.annual,
      pending: pendingLeaves.annual,
      remaining: remainingLeaves.annual,
      color: "#1976d2",
    },
    {
      type: "Sick Leave",
      total: TOTAL_SICK_LEAVES,
      used: usedLeaves.sick,
      pending: pendingLeaves.sick,
      remaining: remainingLeaves.sick,
      color: "#dc004e",
    },
    {
      type: "Personal Leave",
      total: TOTAL_PERSONAL_LEAVES,
      used: usedLeaves.personal,
      pending: pendingLeaves.personal,
      remaining: remainingLeaves.personal,
      color: "#ff9800",
    },
  ];

  // Get recent leave requests
  const recentLeaves = [...(leaves || [])]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name || "User"}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's an overview of your leave management
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "auto",
                minHeight: 160,
                bgcolor: "background.paper",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: `${stat.color}15`,
                  mb: 2,
                }}
              >
                {React.createElement(stat.icon, {
                  sx: { fontSize: 30, color: stat.color },
                })}
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="subtitle1" align="center">
                {stat.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                {stat.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Leave Balance Section */}
      <Grid container spacing={3}>
        {/* Leave Types Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leave Balance Overview
            </Typography>
            {leaveTypes.map((leave, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{leave.type}</Typography>
                  <Typography variant="body2">
                    {leave.remaining} / {leave.total} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(leave.used / leave.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: `${leave.color}22`,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: leave.color,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Used: {leave.used} days
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Pending: {leave.pending} days
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Requests
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLeaves.map((leave, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {leave.leaveType} Leave
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {calculateDays(leave.startDate, leave.endDate)} days
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            color:
                              leave.status === "approved"
                                ? "success.main"
                                : leave.status === "pending"
                                  ? "warning.main"
                                  : "error.main",
                          }}
                        >
                          {leave.status === "approved" ? (
                            <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
                          ) : leave.status === "pending" ? (
                            <PendingActions sx={{ fontSize: 16, mr: 0.5 }} />
                          ) : (
                            <Block sx={{ fontSize: 16, mr: 0.5 }} />
                          )}
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentLeaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No recent leave requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
