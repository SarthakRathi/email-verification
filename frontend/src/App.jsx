// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import DashboardLayout from "./layouts/DashboardLayout";
import SingleEmailVerification from "./pages/SingleEmailVerification";
import BulkEmailVerification from "./pages/BulkEmailVerification";
import Profile from "./pages/Profile";
import VerificationHistory from "./pages/VerificationHistory";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout with nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<BulkEmailVerification />} />
          <Route path="bulk" element={<BulkEmailVerification />} />
          <Route path="single" element={<SingleEmailVerification />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<VerificationHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
