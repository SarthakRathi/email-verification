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
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import axios from "axios";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (value && value.length < 3) {
      setFullNameError("Name must be at least 3 characters");
    } else {
      setFullNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic validation
    let isValid = true;
    if (!fullName) {
      setFullNameError("Full name is required");
      isValid = false;
    } else if (fullName.length < 3) {
      setFullNameError("Name must be at least 3 characters");
      isValid = false;
    }
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
    if (!isValid) return;

    try {
      const response = await axios.post("http://localhost:3001/api/register", {
        fullName,
        email,
        password,
      });
      console.log(response.data);
      // After successful registration, navigate to the login page
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setApiError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(106, 17, 203, 0.9), rgba(37, 117, 252, 0.9))",
          display: "flex",
          flexDirection: "column",
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
            maxWidth: 500,
            borderRadius: "1.5rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            overflow: "visible",
            position: "relative",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "primary.main",
              color: "white",
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          >
            <HowToRegIcon sx={{ fontSize: 40 }} />
          </Paper>

          <CardContent sx={{ pt: 6, px: { xs: 3, sm: 5 } }}>
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleRegister}
              sx={{ textAlign: "center" }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Join us today and start verifying emails
              </Typography>

              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: fullNameError ? 1 : 3 }}
                value={fullName}
                onChange={handleFullNameChange}
                error={!!fullNameError}
                helperText={fullNameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email address"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: emailError ? 1 : 3 }}
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: passwordError ? 1 : 3 }}
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: confirmPasswordError ? 1 : 3 }}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                type="submit"
                sx={{
                  mb: 3,
                  py: 1.5,
                  textTransform: "none",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(37, 117, 252, 0.3)",
                }}
              >
                Register
              </Button>

              <Divider sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 1 }}
                >
                  OR
                </Typography>
              </Divider>

              <Typography variant="body1">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/"
                  underline="hover"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="white" sx={{ mt: 3, opacity: 0.8 }}>
          © {new Date().getFullYear()} Email Verifier. All rights reserved.
        </Typography>
      </Box>
    </>
  );
};

export default Register;
