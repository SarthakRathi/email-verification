// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  styled,
  Box,
  Avatar,
  Chip,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ViewInAr } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const drawerWidth = 240;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: open ? drawerWidth : 0,
  transition: "margin 0.3s ease",
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  minHeight: "100vh",
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: "0 1px 10px rgba(0, 0, 0, 0.05)",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: "all 0.3s ease",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const HeaderButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  color: theme.palette.text.primary,
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  marginLeft: theme.spacing(1),
}));

const BreadcrumbChip = styled(Chip)(({ theme }) => ({
  borderRadius: 6,
  height: 28,
  fontSize: "0.75rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
}));

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [user, setUser] = useState(null); // state for user details
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Fetch user details when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:3001/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
        });
    }
  }, []);

  // Notifications handlers
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Navigate to profile page on account click
  const handleAccountClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <>
      <CssBaseline />
      <StyledAppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ height: 64, px: { xs: 2, sm: 4 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              mr: 2,
              display: { xs: "flex", md: open ? "none" : "flex" },
              color: theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: "flex", md: open ? "none" : "flex" },
              alignItems: "center",
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                width: 32,
                height: 32,
                mr: 1,
                color: theme.palette.primary.main,
              }}
            >
              <ViewInAr fontSize="small" />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 0.5,
              }}
            >
              VerifyPortal
            </Typography>
          </Box>

          {/* Current Page Title */}
          <Box
            sx={{
              ml: { xs: 1, md: open ? 0 : 3 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                display: { xs: "none", sm: "block" },
              }}
            >
              Shail Digital
            </Typography>
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {/* User Profile with fetched user name */}
            <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
              <Button
                onClick={handleAccountClick}
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  p: 1,
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                  }}
                >
                  {user ? user.fullName.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Box
                  sx={{
                    ml: 1,
                    display: { xs: "none", sm: "block" },
                    textAlign: "left",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {user ? user.fullName : "User Name"}
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Sidebar
        open={open}
        onClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />
      <Main open={open}>
        <Toolbar />
        <Outlet />
      </Main>
    </>
  );
};

export default DashboardLayout;
