import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import emailjs from "@emailjs/browser";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { ReactComponent as Logo } from "../../assets/logo.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useAppTheme();
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({
    to_email: "",
    subject: "",
    message: "",
  });
  const [emailStatus, setEmailStatus] = useState({ type: "", message: "" });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    handleClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const navItems = isAuthenticated
    ? [
        {
          label: "Dashboard",
          icon: DashboardIcon,
          onClick: () => navigate("/dashboard"),
        },
        {
          label: "Request Leave",
          icon: EventNoteIcon,
          onClick: () => navigate("/leaves/new"),
        },
        {
          label: "My Leaves",
          icon: ListAltIcon,
          onClick: () => navigate("/leaves"),
        },
        {
          label: "Help",
          icon: HelpIcon,
          onClick: () => navigate("/help"),
        },
      ]
    : [];

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendEmail = async () => {
    try {
      const templateParams = {
        from_name: user.name,
        from_email: user.email,
        to_email: emailData.to_email,
        subject: emailData.subject,
        message: emailData.message,
      };

      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        templateParams,
        "YOUR_PUBLIC_KEY"
      );

      setEmailStatus({
        type: "success",
        message: "Email sent successfully!",
      });

      setTimeout(() => {
        setOpenEmailDialog(false);
        setEmailData({ to_email: "", subject: "", message: "" });
        setEmailStatus({ type: "", message: "" });
      }, 2000);
    } catch (error) {
      setEmailStatus({
        type: "error",
        message: "Failed to send email. Please try again.",
      });
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Logo
          className="logo"
          style={{
            height: "40px",
            width: "40px",
            marginRight: "10px",
            transition: "transform 0.8s ease-in-out",
          }}
        />
        <Typography variant="h6" component="div">
          Leave Manager
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={item.onClick}
              sx={{ textAlign: "left", px: 3 }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {isAuthenticated && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 2,
              "&:hover": {
                "& .logo": {
                  transform: "rotate(360deg)",
                },
              },
            }}
          >
            <Logo
              className="logo"
              style={{
                height: "40px",
                width: "40px",
                marginRight: "10px",
                transition: "transform 0.8s ease-in-out",
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 0,
                display: { xs: "none", sm: "block" },
                fontWeight: "bold",
                letterSpacing: "0.5px",
                background: "linear-gradient(45deg, #3f51b5 30%, #f50057 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Leave Manager
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  startIcon={<item.icon />}
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {!isAuthenticated ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate("/register")}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Register
              </Button>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={handleDrawerToggle}
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          ) : (
            <>
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton color="inherit" onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>

              <Box sx={{ ml: 1 }}>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user?.name}
                      sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                      }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      {isAuthenticated && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Dialog
        open={openEmailDialog}
        onClose={() => setOpenEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          {emailStatus.message && (
            <Alert severity={emailStatus.type} sx={{ mb: 2 }}>
              {emailStatus.message}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="To Email"
            name="to_email"
            value={emailData.to_email}
            onChange={handleEmailChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Subject"
            name="subject"
            value={emailData.subject}
            onChange={handleEmailChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Message"
            name="message"
            value={emailData.message}
            onChange={handleEmailChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
