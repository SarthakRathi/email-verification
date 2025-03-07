import React, { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Avatar,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  VerifiedUser,
  Assignment,
  Dashboard,
  Settings,
  Help,
  Logout,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  ViewList,
  PersonSearch,
} from "@mui/icons-material";

const Sidebar = ({ open, onClose, drawerWidth }) => {
  const theme = useTheme();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Determine if a menu item is active based on current route
  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
    },
    {
      text: "Bulk Verification",
      icon: <ViewList />,
      path: "/dashboard/bulk",
    },
    {
      text: "Single Verification",
      icon: <PersonSearch />,
      path: "/dashboard/single",
    },
    {
      text: "Verification History",
      icon: <Assignment />,
      path: "/dashboard/history",
    },
  ];

  return (
    <Drawer
      variant={open ? "permanent" : "temporary"}
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: "block", md: "block" },
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #f5f7fa 0%, #eef1f5 100%)"
              : "linear-gradient(180deg, #2d3748 0%, #1a202c 100%)",
          color: theme.palette.text.primary,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: theme.palette.primary.main,
          }}
        >
          <VerifiedUser sx={{ mr: 1, verticalAlign: "middle" }} />
          Verify Portal
        </Typography>
        {open && (
          <IconButton onClick={onClose}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            U
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              User Name
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ overflow: "auto", flex: 1, py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ display: "block", mb: 0.5 }}
            >
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: "8px",
                  mx: 1,
                  background: isActive(item.path)
                    ? theme.palette.primary.main + "20"
                    : "transparent",
                  color: isActive(item.path)
                    ? theme.palette.primary.main
                    : "inherit",
                  "&:hover": {
                    background: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleSettingsClick}
              sx={{ px: 2.5, borderRadius: "8px", mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
              {settingsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/profile"
                sx={{ pl: 7, borderRadius: "8px", mx: 1 }}
              >
                <ListItemText primary="Profile" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/dashboard/preferences"
                sx={{ pl: 7, borderRadius: "8px", mx: 1 }}
              >
                <ListItemText primary="Preferences" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/help"
              sx={{ px: 2.5, borderRadius: "8px", mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Help & Support" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          component={Link}
          to="/logout"
          sx={{
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: theme.palette.error.main + "20",
            },
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 0, mr: 2, color: theme.palette.error.main }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              color: theme.palette.error.main,
            }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
