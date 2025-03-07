import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  AlertTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import EmailIcon from "@mui/icons-material/Email";
import PieChartIcon from "@mui/icons-material/PieChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddListModal from "../components/AddListModal";
import axios from "axios";

// Email Results Chart Component
const EmailResultsChart = ({ summary }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !summary || summary.total === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Calculate angles for the pie chart
    const validRatio = summary.valid / summary.total;
    const validEndAngle = validRatio * 2 * Math.PI;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw valid emails (green)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, validEndAngle);
    ctx.fillStyle = "#4caf50";
    ctx.fill();

    // Draw invalid emails (red)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, validEndAngle, 2 * Math.PI);
    ctx.fillStyle = "#f44336";
    ctx.fill();

    // Add inner white circle to create a donut chart
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    // Add text in the center
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(`${Math.round(validRatio * 100)}%`, centerX, centerY - 10);
    ctx.font = "14px Arial";
    ctx.fillText("Valid", centerX, centerY + 15);
  }, [summary]);

  // Return a canvas element
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ maxWidth: "100%" }}
      />
    </Box>
  );
};

const BulkEmailVerification = () => {
  const [openModal, setOpenModal] = useState(false);
  const [emails, setEmails] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmailList, setShowEmailList] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleListCreate = (data) => {
    if (data.type === "file") {
      const file = data.file;
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target.result;
        let emailList = [];

        // Detect file extension to determine how to parse
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension === "csv") {
          // Parse CSV file
          const lines = fileContent.split(/\r\n|\n/);
          emailList = lines.map((line) => {
            // Simple CSV parsing - assumes emails are in the first column
            // or the whole line is an email
            const columns = line.split(",");
            return columns[0].trim();
          });
        } else if (fileExtension === "txt") {
          // Parse TXT file (one email per line)
          emailList = fileContent.split(/\r\n|\n/).map((line) => line.trim());
        } else {
          // For other file types, just split by newlines
          emailList = fileContent.split(/\r\n|\n/).map((line) => line.trim());
        }

        // Filter out empty strings, headers, and duplicates
        // Basic filter to remove common headers and non-email strings
        const filteredEmails = emailList.filter((email) => {
          return (
            email &&
            email.trim() !== "" &&
            email.includes("@") &&
            !email.toLowerCase().startsWith("email") &&
            !email.toLowerCase().includes("name")
          );
        });

        const uniqueEmails = [...new Set(filteredEmails)];
        setEmails(uniqueEmails);
        setResults(null); // Reset results when a new list is added
      };

      reader.readAsText(file);
    } else if (data.type === "paste") {
      // Filter out empty strings and duplicates
      const uniqueEmails = [
        ...new Set(data.emails.filter((email) => email.trim() !== "")),
      ];
      setEmails(uniqueEmails);
      setResults(null); // Reset results when a new list is added
    }
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
    // If we have results, also remove from results
    if (results) {
      setResults(results.filter((result) => result.email !== emailToDelete));
    }
  };

  const handleVerifyBulk = async () => {
    if (emails.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/bulk-verify",
        { emails }
      );
      setResults(response.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats for results
  const getResultsSummary = () => {
    if (!results) return { valid: 0, invalid: 0, total: 0 };

    const valid = results.filter((r) => r.status === "valid").length;
    return {
      valid,
      invalid: results.length - valid,
      total: results.length,
    };
  };

  // Function to download valid emails as a CSV file
  const downloadValidEmails = () => {
    if (!results) return;

    // Filter out only valid emails
    const validEmails = results
      .filter((result) => result.status === "valid")
      .map((result) => result.email);

    if (validEmails.length === 0) {
      alert("No valid emails to download");
      return;
    }

    // Create CSV content - one email per line
    const csvContent = validEmails.join("\n");

    // Create a Blob containing the data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    // Create a temporary URL to the blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "valid_emails.csv");

    // Append to the document
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = getResultsSummary();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Bulk Email Verification
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  Add Emails
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Upload a file or paste a list of emails to verify
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleOpenModal}
                startIcon={<EmailIcon />}
              >
                Add Email List
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {emails.length > 0 ? (
            <Card
              variant="outlined"
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent
                sx={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h6" component="div">
                    Email List
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyBulk}
                    disabled={emails.length === 0 || loading}
                  >
                    {loading ? "Verifying..." : "Verify All"}
                  </Button>
                </Stack>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Chip
                    icon={<EmailIcon />}
                    label={`${emails.length} emails`}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowEmailList(!showEmailList)}
                  >
                    {showEmailList ? "Hide List" : "Show List"}
                  </Button>
                </Box>

                {showEmailList && (
                  <Paper
                    variant="outlined"
                    sx={{ maxHeight: 200, overflow: "auto", p: 1, flex: 1 }}
                  >
                    <List dense>
                      {emails.map((email, idx) => (
                        <ListItem
                          key={idx}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteEmail(email)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={email} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  No emails added yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Click "Add Email List" to get started
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Verifying {emails.length} emails...
          </Typography>
        </Box>
      )}

      {results && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="div" gutterBottom>
            Verification Results
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderLeft: "4px solid #4caf50",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Valid Emails
                    </Typography>
                    {summary.valid > 0 && (
                      <Tooltip title="Download valid emails">
                        <IconButton
                          color="success"
                          onClick={downloadValidEmails}
                          size="small"
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="h3" color="success.main">
                    {summary.valid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((summary.valid / summary.total) * 100).toFixed(1)}% of
                    total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderLeft: "4px solid #f44336",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Invalid Emails
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    {summary.invalid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((summary.invalid / summary.total) * 100).toFixed(1)}% of
                    total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderLeft: "4px solid #2196f3",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Processed
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {summary.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verification complete
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="div">
                  Results Visualization
                </Typography>
                {summary.valid > 0 && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<FileDownloadIcon />}
                    onClick={downloadValidEmails}
                    size="small"
                  >
                    Download Valid Emails
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <EmailResultsChart summary={summary} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Email Validation Summary
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: "#4caf50",
                          mr: 1,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        Valid
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {summary.valid} (
                        {((summary.valid / summary.total) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: "#f44336",
                          mr: 1,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        Invalid
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {summary.invalid} (
                        {((summary.invalid / summary.total) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total processed: {summary.total} emails
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Detailed Results
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {results.map((item, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    borderLeft:
                      item.status === "valid"
                        ? "4px solid #4caf50"
                        : "4px solid #f44336",
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteEmail(item.email)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {item.status === "valid" ? (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <ErrorIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography
                          component="span"
                          sx={{
                            color:
                              item.status === "valid"
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {item.email}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      item.status === "valid"
                        ? "Email passed validation"
                        : "Email failed validation"
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      <AddListModal
        open={openModal}
        onClose={handleCloseModal}
        onListCreate={handleListCreate}
      />
    </Box>
  );
};

export default BulkEmailVerification;
