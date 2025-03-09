// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CssBaseline,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Fade,
  Zoom,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

// Enhanced input field styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    "&.Mui-focused": {
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.95rem",
  },
  "& .MuiInputAdornment-root": {
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.main,
    },
  },
}));

// Submit button styling
const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1.2),
  textTransform: "none",
  fontWeight: "bold",
  boxShadow: theme.shadows[3],
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

// Profile avatar styling
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  backgroundColor: alpha(theme.palette.primary.main, 0.85),
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
  marginBottom: theme.spacing(2),
}));

const Profile = () => {
  const theme = useTheme();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toggle for showing password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Loading and animation states
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [saveProgress, setSaveProgress] = useState(0);

  // User info
  const [userInitial, setUserInitial] = useState("");
  const [lastUpdated, setLastUpdated] = useState(""); // Mock data

  useEffect(() => {
    const mockLoadingProcess = () => {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    };

    mockLoadingProcess();

    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:3001/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setFullName(response.data.fullName);
          setEmail(response.data.email);

          // Set user initial for avatar
          if (response.data.fullName) {
            setUserInitial(response.data.fullName.charAt(0).toUpperCase());
          }

          // Mock last updated date
          setLastUpdated(new Date().toLocaleDateString());
        })
        .catch((err) => {
          console.error("Error fetching user details", err);
          setError("Failed to fetch user details");
        });
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setSaveProgress(0);

    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSaveProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    // Build update object. Only send password if provided.
    const updateData = { fullName, email };
    if (password.trim().length > 0) {
      updateData.password = password;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "http://localhost:3001/api/user",
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      clearInterval(progressInterval);
      setSaveProgress(100);

      setTimeout(() => {
        setSuccess(response.data.message || "Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
        setSaveProgress(0);

        // Update user initial if name changed
        if (fullName) {
          setUserInitial(fullName.charAt(0).toUpperCase());
        }

        // Update last updated date
        setLastUpdated(new Date().toLocaleDateString());
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error updating profile", err);
      setError(err.response?.data?.error || "Failed to update profile");
      setLoading(false);
      setSaveProgress(0);
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box sx={{ textAlign: "center", my: 8, py: 4 }}>
            <CircularProgress size={60} thickness={4} />
            <Box sx={{ width: "50%", mx: "auto", mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={loadProgress}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Loading your profile... {Math.round(loadProgress)}%
              </Typography>
            </Box>
          </Box>
        ) : (
          <Fade in={!isLoading} timeout={800}>
            <Box>
              {/* Header with gradient background */}
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 4,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: "white",
                    p: 3,
                    pb: 7,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    My Profile
                  </Typography>
                  <Typography variant="subtitle1">
                    Manage your personal information and account settings
                  </Typography>
                </Box>

                {/* Main Profile Content */}
                <Card
                  sx={{
                    mx: 3,
                    mt: -4,
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Grid container>
                      {/* Profile Avatar Section */}
                      <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          p: 4,
                          borderRight: {
                            md: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1
                            )}`,
                          },
                          borderBottom: {
                            xs: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1
                            )}`,
                            md: "none",
                          },
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.4
                          ),
                        }}
                      >
                        <Zoom in timeout={800}>
                          <ProfileAvatar>
                            <Typography variant="h3" component="span">
                              {userInitial || "U"}
                            </Typography>
                          </ProfileAvatar>
                        </Zoom>

                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {fullName || "User"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {email || "email@example.com"}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            p: 1.5,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.06
                            ),
                            borderRadius: 2,
                          }}
                        >
                          <CheckCircleIcon
                            fontSize="small"
                            sx={{ color: theme.palette.success.main }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Last updated: {lastUpdated}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Profile Form Section */}
                      <Grid item xs={12} md={8}>
                        <Box sx={{ p: 4 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 3,
                            }}
                          >
                            <Avatar
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                                color: theme.palette.primary.main,
                                mr: 2,
                              }}
                            >
                              <EditIcon />
                            </Avatar>
                            <Typography variant="h6">
                              Edit Profile Information
                            </Typography>
                          </Box>

                          {error && (
                            <Alert
                              severity="error"
                              sx={{
                                mb: 3,
                                borderRadius: 2,
                                boxShadow: `0 2px 10px ${alpha(
                                  theme.palette.error.main,
                                  0.15
                                )}`,
                              }}
                            >
                              {error}
                            </Alert>
                          )}

                          {success && (
                            <Zoom in>
                              <Alert
                                severity="success"
                                sx={{
                                  mb: 3,
                                  borderRadius: 2,
                                  boxShadow: `0 2px 10px ${alpha(
                                    theme.palette.success.main,
                                    0.15
                                  )}`,
                                }}
                                icon={<CheckCircleIcon fontSize="inherit" />}
                              >
                                {success}
                              </Alert>
                            </Zoom>
                          )}

                          <Box
                            component="form"
                            onSubmit={handleUpdate}
                            noValidate
                          >
                            <Box sx={{ mb: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                }}
                              >
                                <AccountCircleIcon
                                  sx={{ mr: 1, fontSize: 18 }}
                                />
                                Personal Information
                              </Typography>

                              <StyledTextField
                                fullWidth
                                margin="normal"
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PersonIcon />
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <StyledTextField
                                fullWidth
                                margin="normal"
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <EmailIcon />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>

                            <Divider sx={{ my: 3, opacity: 0.6 }} />

                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                }}
                              >
                                <SecurityIcon sx={{ mr: 1, fontSize: 18 }} />
                                Password Settings
                              </Typography>

                              <StyledTextField
                                fullWidth
                                margin="normal"
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                helperText="Leave blank if you don't want to change your password"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LockIcon />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Tooltip
                                        title={
                                          showPassword
                                            ? "Hide password"
                                            : "Show password"
                                        }
                                      >
                                        <IconButton
                                          onClick={() =>
                                            setShowPassword(!showPassword)
                                          }
                                          edge="end"
                                        >
                                          {showPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <StyledTextField
                                fullWidth
                                margin="normal"
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LockIcon />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Tooltip
                                        title={
                                          showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                        }
                                      >
                                        <IconButton
                                          onClick={() =>
                                            setShowConfirmPassword(
                                              !showConfirmPassword
                                            )
                                          }
                                          edge="end"
                                        >
                                          {showConfirmPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>

                            <Box sx={{ mt: 4, position: "relative" }}>
                              <SubmitButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                startIcon={
                                  loading ? (
                                    <CircularProgress
                                      size={24}
                                      color="inherit"
                                    />
                                  ) : (
                                    <SaveIcon />
                                  )
                                }
                              >
                                {loading ? "Saving Changes..." : "Save Changes"}
                              </SubmitButton>

                              {loading && (
                                <LinearProgress
                                  variant="determinate"
                                  value={saveProgress}
                                  sx={{
                                    position: "absolute",
                                    bottom: -8,
                                    left: 0,
                                    right: 0,
                                    height: 6,
                                    borderRadius: "0 0 8px 8px",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </>
  );
};

export default Profile;
