import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  styled,
  Box,
  Avatar,
  Badge,
  Chip,
  Button,
  alpha,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  Mail as MailIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowDown,
  ViewInAr,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";

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
  const theme = useTheme();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Function to get the current page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/dashboard/single") return "Shail Automation";
    if (path === "/dashboard/bulk") return "Shail Automation";
    if (path === "/dashboard/history") return "Verification History";
    if (path === "/dashboard/analytics") return "Analytics";
    return "Dashboard";
  };

  // Get the breadcrumb unless on single or bulk pages
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (
      path === "/dashboard" ||
      path === "/dashboard/single" ||
      path === "/dashboard/bulk"
    )
      return null;

    const segments = path.split("/").filter(Boolean);
    if (segments.length > 1) {
      return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    }
    return null;
  };

  const breadcrumb = getBreadcrumb();

  // Handle notifications
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
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

          {/* Mobile Logo - shown when sidebar is closed or on mobile */}
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
              {getPageTitle()}
            </Typography>
            {breadcrumb && (
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <BreadcrumbChip
                  label={breadcrumb}
                  size="small"
                  icon={<KeyboardArrowDown fontSize="small" />}
                />
              </Box>
            )}
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <HeaderButton onClick={handleNotificationsOpen}>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </HeaderButton>
            </Tooltip>

            {/* Removed Search and Settings from header */}

            {/* Help */}
            <Tooltip title="Help">
              <HeaderButton>
                <HelpIcon fontSize="small" />
              </HeaderButton>
            </Tooltip>

            {/* User Profile (no dropdown) */}
            <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
              <Button
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  p: 1,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
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
                  U
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
                    User Name
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: 380,
            borderRadius: 2,
            overflow: "auto",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: -6,
              right: 14,
              width: 12,
              height: 12,
              bgcolor: "background.paper",
              transform: "rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Chip label="4 new" size="small" color="primary" />
        </Box>
        <Divider />
        <MenuItem onClick={handleNotificationsClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Bulk Verification Complete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1000 emails processed successfully
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1.5, textAlign: "center" }}>
          <Button
            variant="text"
            fullWidth
            onClick={handleNotificationsClose}
            sx={{
              borderRadius: 6,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>

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
