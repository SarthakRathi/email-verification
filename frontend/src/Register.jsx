// src/Register.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  CssBaseline,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          background:
            "linear-gradient(to right, rgba(106, 17, 203, 1), rgba(37, 117, 252, 1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Card
          sx={{
            width: "90%",
            maxWidth: 400,
            borderRadius: "1rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>
            <Box component="form" sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="div"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                Register
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create your account
              </Typography>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                label="Email address"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mb: 2, py: 1.5, textTransform: "none" }}
              >
                Register
              </Button>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/"
                  underline="hover"
                  color="primary"
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Register;
