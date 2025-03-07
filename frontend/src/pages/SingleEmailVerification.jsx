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
} from "@mui/material";
import axios from "axios";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const SingleEmailVerification = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleVerifyEmail = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/single-verify",
        { email }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Verification failed" });
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
    return result.status === "valid" ? "success" : "error";
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.error) return <ErrorIcon />;
    return result.status === "valid" ? <CheckCircleIcon /> : <ErrorIcon />;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Single Email Verification
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{ display: "flex", gap: 2, mb: 3, alignItems: "flex-start" }}
          >
            <TextField
              label="Enter email address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerifyEmail}
              disabled={!email.trim() || loading}
              startIcon={<SearchIcon />}
              sx={{ height: 56, px: 3 }}
            >
              Verify
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <InfoIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Check if an email address is valid, properly formatted, and
              deliverable
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              size="small"
              icon={<EmailIcon />}
              label="Syntax Check"
              variant="outlined"
            />
            <Chip size="small" label="Format Validation" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ textAlign: "center", my: 4, py: 4 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Verifying email...
          </Typography>
        </Box>
      )}

      {result && !result.error && (
        <Card
          variant="outlined"
          sx={{
            mb: 4,
            borderLeft:
              result.status === "valid"
                ? "4px solid #4caf50"
                : "4px solid #f44336",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {result.status === "valid" ? (
                  <CheckCircleIcon color="success" fontSize="large" />
                ) : (
                  <ErrorIcon color="error" fontSize="large" />
                )}
                <Typography variant="h5" component="div">
                  Verification Result
                </Typography>
              </Box>

              <Chip
                label={result.status.toUpperCase()}
                color={getStatusColor()}
                icon={getStatusIcon()}
                variant="filled"
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {result.email}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Message
                  </Typography>
                  <Typography variant="body1">{result.message}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6" component="div">
                API Response
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyResult}
                color={copySuccess ? "success" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy JSON"}
              </Button>
            </Box>

            <Paper
              sx={{
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                fontFamily: "monospace",
                overflow: "auto",
                maxHeight: "200px",
              }}
              variant="outlined"
            >
              <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
            </Paper>
          </CardContent>
        </Card>
      )}

      {result && result.error && (
        <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
          <Typography variant="subtitle1">Verification Failed</Typography>
          <Typography variant="body2">{result.error}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SingleEmailVerification;
