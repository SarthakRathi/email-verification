import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const SingleEmailVerification = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Box>
      <Typography variant="h5" component="div" gutterBottom>
        Single Email Verification
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Enter email address to verify"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="contained" color="warning" onClick={handleVerifyEmail}>
          Verify Email
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        * Each single verification will cost 1 verification credit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        ** No credit deduction for internal errors or timeouts
      </Typography>
      {loading && (
        <Box sx={{ textAlign: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {result && !result.error && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" component="div">
            Verification Result
          </Typography>
          <Typography>
            <strong>Email:</strong> {result.email}
          </Typography>
          <Typography>
            <strong>Status:</strong> {result.status}
          </Typography>
          <Typography>{result.message}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" component="div">
            API Response
          </Typography>
          <Paper
            sx={{ p: 2, mt: 1, backgroundColor: "#f9f9f9" }}
            variant="outlined"
          >
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </Paper>
        </Paper>
      )}
      {result && result.error && (
        <Typography color="error">{result.error}</Typography>
      )}
    </Box>
  );
};

export default SingleEmailVerification;
