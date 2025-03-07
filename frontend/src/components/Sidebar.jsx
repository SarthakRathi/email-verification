import React, { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Avatar,
  useTheme,
  Tooltip,
  alpha,
  Button,
  Paper,
  Chip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard,
  EmailOutlined,
  PersonSearch,
  ViewList,
  History,
  Speed,
  ArrowBackIos,
  ViewInAr,
  Tune,
  HelpOutline,
  Logout,
} from "@mui/icons-material";

const Sidebar = ({ open, onClose, drawerWidth }) => {
  const theme = useTheme();
  const location = useLocation();

  // Define helper functions first
  const isActive = (path) => location.pathname === path;
  const isPartOfRoute = (path) => location.pathname.startsWith(path);

  const [submenuOpen, setSubmenuOpen] = useState({
    emailVerification:
      isPartOfRoute("/dashboard/single") || isPartOfRoute("/dashboard/bulk"),
  });

  const toggleSubmenu = (key) => {
    setSubmenuOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
      exact: true,
    },
    {
      text: "Email Verification",
      icon: <EmailOutlined />,
      submenu: [
        {
          text: "Single Verification",
          icon: <PersonSearch fontSize="small" />,
          path: "/dashboard/single",
        },
        {
          text: "Bulk Verification",
          icon: <ViewList fontSize="small" />,
          path: "/dashboard/bulk",
        },
      ],
    },
    {
      text: "Verification History",
      icon: <History />,
      path: "/dashboard/history",
    },
    {
      text: "Analytics",
      icon: <Speed />,
      path: "/dashboard/analytics",
      // Removed chip: "New"
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
              ? `linear-gradient(145deg, ${alpha(
                  theme.palette.background.paper,
                  0.9
                )}, ${alpha(theme.palette.background.default, 0.95)})`
              : `linear-gradient(145deg, ${alpha(
                  theme.palette.grey[900],
                  0.95
                )}, ${alpha(theme.palette.grey[800], 0.9)})`,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: open ? theme.shadows[3] : "none",
          transition: theme.transitions.create(["box-shadow", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Logo and Brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            height: 64,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                width: 36,
                height: 36,
                mr: 1.5,
                backdropFilter: "blur(4px)",
              }}
            >
              <ViewInAr />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Verify<span style={{ opacity: 0.9 }}>Portal</span>
            </Typography>
          </Box>
          {open && (
            <Tooltip title="Collapse sidebar">
              <IconButton onClick={onClose} sx={{ color: "white" }}>
                <ArrowBackIos sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Main Menu */}
        <Box
          sx={{
            overflow: "auto",
            flex: 1,
            py: 1.5,
            px: 1.5,
            "&::-webkit-scrollbar": { width: "0.4em" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: "10px",
              "&:hover": { background: alpha(theme.palette.primary.main, 0.2) },
            },
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              px: 2,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: 1,
              display: "block",
              mb: 1,
            }}
          >
            Main Menu
          </Typography>

          <List sx={{ pt: 0 }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                {item.submenu ? (
                  <Box sx={{ mb: 0.5 }}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => toggleSubmenu("emailVerification")}
                        sx={{
                          minHeight: 44,
                          px: 2,
                          borderRadius: 2,
                          backgroundColor: submenuOpen.emailVerification
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent",
                          color: submenuOpen.emailVerification
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            color: submenuOpen.emailVerification
                              ? theme.palette.primary.main
                              : alpha(theme.palette.text.primary, 0.7),
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: submenuOpen.emailVerification
                              ? 600
                              : 500,
                            fontSize: "0.9rem",
                          }}
                        />
                        {submenuOpen.emailVerification ? (
                          <Typography variant="caption">–</Typography>
                        ) : (
                          <Typography variant="caption">+</Typography>
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse
                      in={submenuOpen.emailVerification}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding sx={{ mt: 0.5 }}>
                        {item.submenu.map((subItem) => (
                          <ListItem
                            key={subItem.text}
                            disablePadding
                            sx={{ mb: 0.5 }}
                          >
                            <ListItemButton
                              component={Link}
                              to={subItem.path}
                              sx={{
                                minHeight: 36,
                                pl: 5,
                                pr: 2,
                                py: 0.5,
                                borderRadius: 2,
                                backgroundColor: isActive(subItem.path)
                                  ? alpha(theme.palette.primary.main, 0.12)
                                  : "transparent",
                                color: isActive(subItem.path)
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.text.primary, 0.8),
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.08
                                  ),
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 26,
                                  color: isActive(subItem.path)
                                    ? theme.palette.primary.main
                                    : alpha(theme.palette.text.primary, 0.6),
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontWeight: isActive(subItem.path)
                                    ? 600
                                    : 400,
                                  fontSize: "0.85rem",
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ) : (
                  <ListItem
                    disablePadding
                    sx={{ mb: 0.5, position: "relative" }}
                  >
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      sx={{
                        minHeight: 44,
                        px: 2,
                        borderRadius: 2,
                        backgroundColor: isActive(item.path)
                          ? alpha(theme.palette.primary.main, 0.12)
                          : "transparent",
                        color: isActive(item.path)
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
                          ),
                        },
                        position: "relative",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive(item.path)
                            ? theme.palette.primary.main
                            : alpha(theme.palette.text.primary, 0.7),
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 500,
                          fontSize: "0.9rem",
                        }}
                      />
                      {item.badge && (
                        <Box sx={{ position: "absolute", top: 8, right: 16 }}>
                          <Typography variant="caption" color="error">
                            {item.badge}
                          </Typography>
                        </Box>
                      )}
                      {item.chip && (
                        <Chip
                          label={item.chip}
                          size="small"
                          color="primary"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            borderRadius: 1,
                            ml: 1,
                            px: 0.5,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                )}
              </React.Fragment>
            ))}
          </List>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              px: 2,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: 1,
              display: "block",
              mt: 2,
              mb: 1,
            }}
          >
            {/* Removed Settings & Support */}
          </Typography>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            mt: "auto",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Button
            component={Link}
            to="/logout"
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            sx={{
              borderRadius: 8,
              py: 1,
              textTransform: "none",
              borderColor: alpha(theme.palette.error.main, 0.3),
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                borderColor: theme.palette.error.main,
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
