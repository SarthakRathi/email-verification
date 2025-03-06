import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Toolbar,
} from "@mui/material";
import { Link } from "react-router-dom";

const Sidebar = ({ open, onClose, drawerWidth }) => {
  return (
    <Drawer
      variant={open ? "permanent" : "temporary"}
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: "block", md: "block" },
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard/bulk">
              <ListItemText primary="Bulk Verification" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard/single">
              <ListItemText primary="Single Verification" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
