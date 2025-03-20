import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  PendingActions,
  Block,
  Sort,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { deleteLeave, editLeave } from "../../features/leaves/leaveSlice";

const LeaveList = () => {
  const dispatch = useDispatch();
  const { leaves } = useSelector((state) => state.leaves);
  const { user } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editFormData, setEditFormData] = useState({
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
  });
  const [error, setError] = useState("");

  const leaveTypes = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "personal", label: "Personal Leave" },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle fontSize="small" />;
      case "pending":
        return <PendingActions fontSize="small" />;
      case "rejected":
        return <Block fontSize="small" />;
      default:
        return null;
    }
  };

  // Get user's leaves first
  const userLeaves = leaves.filter((leave) => leave.userId === user.id);

  // Then apply filters and sorting to user's leaves
  const filteredLeaves = userLeaves
    .filter((leave) => {
      const matchesStatus =
        filterStatus === "all" ||
        leave.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesType =
        filterType === "all" ||
        leave.leaveType.toLowerCase() === filterType.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.status.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleEditClick = (leave) => {
    setSelectedLeave(leave);
    setEditFormData({
      leaveType: leave.leaveType,
      startDate: new Date(leave.startDate),
      endDate: new Date(leave.endDate),
      reason: leave.reason,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (leave) => {
    setSelectedLeave(leave);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (
      !editFormData.leaveType ||
      !editFormData.startDate ||
      !editFormData.endDate ||
      !editFormData.reason
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (editFormData.endDate < editFormData.startDate) {
      setError("End date cannot be before start date");
      return;
    }

    dispatch(
      editLeave({
        id: selectedLeave.id,
        ...editFormData,
        status: "pending", // Reset status to pending for review
      })
    );
    setEditDialogOpen(false);
    setError("");
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteLeave(selectedLeave.id));
    setDeleteDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Leave Requests
        </Typography>

        {/* Filters and Search */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {leaveTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reason, type, or status..."
            sx={{ flexGrow: 1 }}
          />

          <Tooltip
            title={`Sort by date ${sortOrder === "desc" ? "ascending" : "descending"}`}
          >
            <IconButton
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              <Sort
                sx={{
                  transform: sortOrder === "asc" ? "rotate(180deg)" : "none",
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Leave Requests Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No leave requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {leave.leaveType} Leave
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(leave.status)}
                        label={leave.status}
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEditClick(leave)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteClick(leave)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Leave Request</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={editFormData.leaveType}
                label="Leave Type"
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    leaveType: e.target.value,
                  })
                }
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={editFormData.startDate}
                  onChange={(date) =>
                    setEditFormData({ ...editFormData, startDate: date })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={editFormData.endDate}
                  onChange={(date) =>
                    setEditFormData({ ...editFormData, endDate: date })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={editFormData.reason}
              onChange={(e) =>
                setEditFormData({ ...editFormData, reason: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this leave request?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveList;
