import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  Login,
  Dashboard,
  EventNote,
  ListAlt,
  CheckCircle,
} from "@mui/icons-material";

const Help = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: Login,
      content: [
        "Use the demo account credentials provided on the login page",
        "Email: demo@example.com",
        "Password: demo123",
        "After logging in, you will be redirected to the Dashboard",
      ],
    },
    {
      title: "Dashboard Overview",
      icon: Dashboard,
      content: [
        "View your total leave balance across all leave types",
        "See pending leave requests awaiting approval",
        "Track total leave days taken",
        "Monitor leave balances with visual progress bars",
        "View recent leave requests and their status",
      ],
    },
    {
      title: "Requesting Leave",
      icon: EventNote,
      content: [
        'Click "Request Leave" in the navigation bar',
        "Select the type of leave (Annual, Sick, or Personal)",
        "Choose start and end dates",
        "Provide a reason for your leave request",
        "Submit the form to create a new leave request",
      ],
    },
    {
      title: "Managing Leave Requests",
      icon: ListAlt,
      content: [
        'View all your leave requests in "My Leaves"',
        "Search for specific leave requests using the search bar",
        "Filter leaves by status (Approved, Pending, Rejected)",
        "Filter by leave type (Annual, Sick, Personal)",
        "Sort leaves by date (newest or oldest first)",
      ],
    },
    {
      title: "Leave Status Guide",
      icon: CheckCircle,
      content: [
        "Pending (Orange) - Request is awaiting approval",
        "Approved (Green) - Request has been approved",
        "Rejected (Red) - Request has been denied",
      ],
    },
    {
      title: "Leave Types and Limits",
      icon: EventNote,
      content: [
        "Annual Leave: 20 days per year",
        "Sick Leave: 12 days per year",
        "Personal Leave: 5 days per year",
        "Leave balance is updated automatically when leaves are approved",
      ],
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Help & Documentation
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Welcome to the Leave Management System! This guide will help you
          understand how to use the application effectively.
        </Typography>

        <Box sx={{ mt: 3 }}>
          {sections.map((section, index) => (
            <Accordion key={index} defaultExpanded={index === 0}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <section.icon color="primary" />
                  <Typography variant="h6">{section.title}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {section.content.map((item, itemIndex) => (
                    <ListItem key={itemIndex}>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
              {index < sections.length - 1 && <Divider />}
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default Help;
