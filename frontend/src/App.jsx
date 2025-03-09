// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Login from "./Login";
import Register from "./Register";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import SingleEmailVerification from "./pages/SingleEmailVerification";
import BulkEmailVerification from "./pages/BulkEmailVerification";
import Profile from "./pages/Profile";
import VerificationHistory from "./pages/VerificationHistory";

// Create the purple theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#412574", // Material Design purple
    },
    text: {
      primary: "#412574", // A darker purple for text
    },
  },
});

// Inline ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bulk" element={<BulkEmailVerification />} />
            <Route path="single" element={<SingleEmailVerification />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<VerificationHistory />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
