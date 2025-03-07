import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Grid,
  InputAdornment,
  Container,
  Fade,
  Zoom,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  Collapse,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import DomainVerificationIcon from "@mui/icons-material/DomainVerification";
import SecurityIcon from "@mui/icons-material/Security";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const SingleEmailVerification = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [recentEmails, setRecentEmails] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const handleVerifyEmail = async () => {
    if (!email.trim()) return;

    // Add to recent emails if not already there
    if (!recentEmails.includes(email)) {
      setRecentEmails((prev) => [email, ...prev.slice(0, 4)]);
    }

    setLoading(true);
    setResult(null);
    setVerificationProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/single-verify",
        { email }
      );
      setResult(response.data);

      // Complete the progress
      clearInterval(progressInterval);
      setVerificationProgress(100);

      // Reset progress after a short delay
      setTimeout(() => {
        setVerificationProgress(0);
      }, 1000);
    } catch (err) {
      console.error(err);
      setResult({ error: "Verification failed" });
      clearInterval(progressInterval);
      setVerificationProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard
      .writeText(JSON.stringify(result, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerifyEmail();
    }
  };

  const getStatusColor = () => {
    if (!result) return "default";
    if (result.error) return "error";
    if (result.status === "valid") return "success";
    if (result.status === "risky") return "warning";
    return "error"; // default for invalid
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.error) return <ErrorIcon />;
    if (result.status === "valid") return <CheckCircleIcon />;
    if (result.status === "risky") return <WarningIcon />;
    return <ErrorIcon />;
  };

  const clearRecentEmails = () => {
    setRecentEmails([]);
    setShowRecent(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          overflow: "hidden",
          borderRadius: 2,
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
            Email Verification Tool
          </Typography>
          <Typography variant="subtitle1">
            Validate email addresses instantly with advanced diagnostic
            capabilities
          </Typography>
        </Box>

        <Card
          sx={{
            mx: 3,
            mt: -4,
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[5],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Enter email address"
                placeholder="example@domain.com"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyEmail}
                disabled={!email.trim() || loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SearchIcon />
                  )
                }
                sx={{
                  height: 56,
                  px: 4,
                  borderRadius: 2,
                  width: { xs: "100%", sm: "auto" },
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </Box>

            {recentEmails.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Button
                    size="small"
                    startIcon={
                      showRecent ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={() => setShowRecent(!showRecent)}
                    color="inherit"
                    sx={{ textTransform: "none" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HistoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Recent Verifications
                      </Typography>
                    </Box>
                  </Button>
                  <Tooltip title="Clear history">
                    <IconButton
                      size="small"
                      onClick={clearRecentEmails}
                      sx={{ opacity: 0.7 }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Collapse in={showRecent}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    {recentEmails.map((recentEmail, index) => (
                      <Chip
                        key={index}
                        label={recentEmail}
                        size="small"
                        variant="outlined"
                        onClick={() => setEmail(recentEmail)}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            )}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexWrap: "wrap",
                gap: 1,
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
              }}
            >
              <InfoIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Our advanced verification checks email syntax, domain validity,
                and deliverability
              </Typography>

              <Button
                size="small"
                endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{
                  ml: "auto!important",
                  textTransform: "none",
                  color: theme.palette.text.secondary,
                }}
              >
                {showAdvanced ? "Hide" : "Show"} Details
              </Button>
            </Stack>

            <Collapse in={showAdvanced}>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <EmailIcon color="primary" />
                      <Typography variant="subtitle2">Syntax Check</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Validates the email format according to RFC standards
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <DomainVerificationIcon color="primary" />
                      <Typography variant="subtitle2">Domain Check</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Verifies domain existence and mail server records
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <SecurityIcon color="primary" />
                      <Typography variant="subtitle2">
                        Risk Assessment
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Detects disposable emails and potential fraud patterns
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>

          {loading && verificationProgress > 0 && (
            <LinearProgress
              variant="determinate"
              value={verificationProgress}
              sx={{ height: 4 }}
            />
          )}
        </Card>
      </Paper>

      {loading && (
        <Fade in={loading}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1" sx={{ mt: 3, fontWeight: "medium" }}>
              Verifying email address...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Checking mail servers and deliverability
            </Typography>
          </Box>
        </Fade>
      )}

      {result && !result.error && (
        <Zoom in={Boolean(result)} timeout={500}>
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
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  result.status === "valid"
                    ? alpha(theme.palette.success.main, 0.1)
                    : result.status === "risky"
                    ? alpha(theme.palette.warning.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {result.status === "valid" ? (
                  <CheckCircleIcon color="success" fontSize="large" />
                ) : result.status === "risky" ? (
                  <WarningIcon color="warning" fontSize="large" />
                ) : (
                  <ErrorIcon color="error" fontSize="large" />
                )}
                <Box>
                  <Typography variant="h6" component="div">
                    Verification Results
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.status === "valid"
                      ? "This email address appears valid and deliverable"
                      : result.status === "risky"
                      ? "This email might have deliverability issues"
                      : "This email address is invalid or undeliverable"}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={result.status.toUpperCase()}
                color={getStatusColor()}
                icon={getStatusIcon()}
                variant="filled"
                sx={{
                  borderRadius: 1,
                  fontWeight: "bold",
                  px: 1,
                  "& .MuiChip-icon": { mr: 0.5 },
                }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: `inset 0 0 0 1px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Email Address
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {result.email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      boxShadow: `inset 0 0 0 1px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Verification Message
                      </Typography>
                      <Typography variant="body1">{result.message}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="div">
                  Full API Response
                </Typography>
                <Tooltip
                  title={copySuccess ? "Copied!" : "Copy JSON"}
                  placement="top"
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      copySuccess ? <CheckCircleIcon /> : <ContentCopyIcon />
                    }
                    onClick={handleCopyResult}
                    color={copySuccess ? "success" : "primary"}
                    sx={{
                      borderRadius: 6,
                      textTransform: "none",
                      px: 2,
                    }}
                  >
                    {copySuccess ? "Copied!" : "Copy JSON"}
                  </Button>
                </Tooltip>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#1e293b", // Dark theme for code
                  color: "#e2e8f0",
                  borderRadius: 2,
                  fontFamily: '"Fira Code", "Roboto Mono", monospace',
                  overflow: "auto",
                  maxHeight: "250px",
                }}
              >
                <pre style={{ margin: 0, overflow: "auto" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Paper>
            </Box>
          </Paper>
        </Zoom>
      )}

      {result && result.error && (
        <Zoom in={Boolean(result && result.error)} timeout={500}>
          <Alert
            severity="error"
            variant="filled"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Verification Failed
              </Typography>
              <Typography variant="body2">
                {result.error ||
                  "An unexpected error occurred. Please try again."}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setResult(null)}
                sx={{
                  mt: 1,
                  alignSelf: "flex-start",
                  borderRadius: 6,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.8)",
                  },
                }}
              >
                Dismiss
              </Button>
            </Box>
          </Alert>
        </Zoom>
      )}
    </Container>
  );
};

export default SingleEmailVerification;
