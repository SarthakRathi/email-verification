// src/Login.jsx
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
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: Add real authentication logic
    navigate("/dashboard");
  };

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
                Login
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Please enter your login and password!
              </Typography>
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
              <Box sx={{ textAlign: "right", mb: 2 }}>
                <Link
                  href="#"
                  underline="hover"
                  color="textSecondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mb: 2, py: 1.5, textTransform: "none" }}
                onClick={handleLogin}
              >
                Login
              </Button>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  color="primary"
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Login;
