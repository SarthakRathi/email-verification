import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Sidebar";

const drawerWidth = 240;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: open ? drawerWidth : 0,
  transition: "margin 0.3s ease",
  ...(open && { marginLeft: drawerWidth }),
}));

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" noWrap>
            shail automation
          </Typography>
        </Toolbar>
      </AppBar>
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
