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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Container,
  useTheme,
  alpha,
  Alert,
  LinearProgress,
  Tooltip,
  Avatar,
  Fade,
  Zoom,
  Badge, // still imported if needed elsewhere
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  Error,
  Warning,
  Email,
  FileDownload,
  ExpandMore,
  FilterList,
  CloudUpload,
  InsertDriveFile,
  Delete,
  RestartAlt,
  CloudDone,
  Assessment,
} from "@mui/icons-material";
import AddListModal from "../components/AddListModal";
import axios from "axios";

// ----- Enhanced Styled Components -----
const StyledAccordion = styled(Accordion)(({ theme, bgcolor, expanded }) => ({
  backgroundColor: expanded ? alpha(bgcolor, 0.7) : alpha(bgcolor, 0.5),
  color: theme.palette.getContrastText(bgcolor),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  boxShadow: expanded
    ? `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}, 0 1px 1px ${alpha(
        theme.palette.common.black,
        0.05
      )}`
    : `0 6px 15px ${alpha(theme.palette.common.black, 0.05)}, 0 1px 1px ${alpha(
        theme.palette.common.black,
        0.03
      )}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "none",
  overflow: "hidden",
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: theme.spacing(0, 0, 2),
    transform: "translateY(-2px)",
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "& .MuiAccordionSummary-content": {
    margin: 0,
    alignItems: "center",
  },
  "&.Mui-expanded": {
    minHeight: 0,
    borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
}));

// ----- Improved Download Button (used in accordions) -----
// Removed the Badge and count display.
const DownloadButton = ({ onClick }) => (
  <Tooltip title="Export as CSV">
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      size="small"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(4px)",
        borderRadius: "8px",
        padding: "4px 8px",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        },
      }}
    >
      <Typography variant="caption" sx={{ color: "inherit", fontWeight: 500 }}>
        Export
      </Typography>
    </IconButton>
  </Tooltip>
);

// ----- Improved Email List Item -----
// Removed the message text and on-hover style.
const EmailListItem = ({ email, status, icon, color, onDelete }) => (
  <ListItem
    sx={{
      borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      // Removed hover effect:
      // "&:hover": {
      //   backgroundColor: "rgba(0, 0, 0, 0.02)",
      //   transform: "translateX(2px)",
      // },
      "&:last-child": {
        borderBottom: "none",
      },
      padding: "8px 16px",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
        {icon}
        <Box sx={{ ml: 1.5, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", display: "block" }}
          >
            {email}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Chip
          label={status}
          size="small"
          sx={{
            backgroundColor: `${color}15`,
            color: color,
            fontWeight: 500,
            borderRadius: "4px",
            height: "24px",
            mr: 1,
          }}
        />
        {onDelete && (
          <Tooltip title="Remove email">
            <IconButton
              size="small"
              onClick={() => onDelete(email)}
              sx={{ opacity: 0.6 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  </ListItem>
);

// ----- Enhanced Email Results Chart Component -----
const EmailResultsChart = ({ summary }) => {
  const theme = useTheme();
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !summary || summary.total === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = centerX - 20;
    const validRatio = summary.valid / summary.total;
    const riskyRatio = summary.risky / summary.total;
    const validAngle = validRatio * 2 * Math.PI;
    const riskyAngle = riskyRatio * 2 * Math.PI;

    ctx.clearRect(0, 0, size, size);

    // Draw shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Valid segment (green)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + validAngle);
    ctx.fillStyle = theme.palette.success.main;
    ctx.fill();

    // Risky segment (orange)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2 + validAngle,
      -Math.PI / 2 + validAngle + riskyAngle
    );
    ctx.fillStyle = theme.palette.warning.main;
    ctx.fill();

    // Invalid segment (red)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2 + validAngle + riskyAngle,
      -Math.PI / 2 + 2 * Math.PI
    );
    ctx.fillStyle = theme.palette.error.main;
    ctx.fill();

    // Remove shadow for inner circle
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Inner white circle (donut effect)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.65, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fill();

    // Add a subtle inner border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.65, 0, 2 * Math.PI);
    ctx.strokeStyle = alpha(theme.palette.divider, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center text (valid %)
    ctx.font = `bold ${24 * dpr}px ${theme.typography.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.palette.text.primary;
    ctx.fillText(`${Math.round(validRatio * 100)}%`, centerX, centerY - 12);

    ctx.font = `${16 * dpr}px ${theme.typography.fontFamily}`;
    ctx.fillStyle = theme.palette.success.main;
    ctx.fillText("Valid", centerX, centerY + 15);
  }, [summary, theme]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        py: 2,
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

// ----- Enhanced Bulk Email Verification Component -----
const BulkEmailVerification = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [emails, setEmails] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleListCreate = (data) => {
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 25;
      });
    }, 300);

    if (data.type === "file") {
      const file = data.file;
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        let emailList = [];
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (fileExtension === "csv") {
          const lines = fileContent.split(/\r\n|\n/);
          emailList = lines.map((line) => {
            const columns = line.split(",");
            return columns[0].trim();
          });
        } else {
          emailList = fileContent.split(/\r\n|\n/).map((line) => line.trim());
        }
        const filteredEmails = emailList.filter(
          (email) =>
            email &&
            email.trim() !== "" &&
            email.includes("@") &&
            !email.toLowerCase().startsWith("email") &&
            !email.toLowerCase().includes("name")
        );
        const uniqueEmails = [...new Set(filteredEmails)];
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setEmails(uniqueEmails);
          setResults(null);
          setUploadProgress(0);
        }, 500);
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
    if (results) {
      setResults(results.filter((result) => result.email !== emailToDelete));
    }
  };

  const handleVerifyBulk = async () => {
    if (emails.length === 0) return;
    setLoading(true);
    setResults(null);
    setVerificationProgress(0);
    const progressInterval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 5;
      });
    }, 500);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/bulk-verify",
        { emails }
      );
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setTimeout(() => {
        setResults(response.data.results);
        setVerificationProgress(0);
        if (response.data.results.some((r) => r.status === "valid")) {
          setActiveAccordion("valid");
        } else if (response.data.results.some((r) => r.status === "risky")) {
          setActiveAccordion("risky");
        } else {
          setActiveAccordion("invalid");
        }
      }, 500);
    } catch (err) {
      console.error(err);
      clearInterval(progressInterval);
      setVerificationProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setActiveAccordion(isExpanded ? panel : null);
  };

  const getResultsSummary = () => {
    if (!results) return { valid: 0, invalid: 0, risky: 0, total: 0 };
    const valid = results.filter((r) => r.status === "valid").length;
    const invalid = results.filter((r) => r.status === "invalid").length;
    const risky = results.filter((r) => r.status === "risky").length;
    const total = results.length;
    return { valid, invalid, risky, total };
  };

  const downloadEmails = (emailsArray, category) => {
    if (!emailsArray || emailsArray.length === 0) return;
    const csvContent = emailsArray.map((e) => e.email).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${category}_emails.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetVerification = () => {
    setResults(null);
    setActiveAccordion(null);
  };

  const summary = getResultsSummary();
  const validEmails = results
    ? results.filter((r) => r.status === "valid")
    : [];
  const riskyEmails = results
    ? results.filter((r) => r.status === "risky")
    : [];
  const invalidEmails = results
    ? results.filter((r) => r.status === "invalid")
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            Bulk Email Verification
          </Typography>
          <Typography variant="subtitle1">
            Verify multiple email addresses at once for deliverability and
            validity
          </Typography>
        </Box>

        {/* Main Card with Add Emails section */}
        <Card
          sx={{
            mx: 3,
            mt: -4,
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    boxShadow: `0 4px 14px ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 3,
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            color: theme.palette.primary.main,
                            mr: 1.5,
                          }}
                        >
                          <CloudUpload />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          Add Emails
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Upload a CSV file containing email addresses or paste a
                        list of emails to verify in bulk
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleOpenModal}
                      startIcon={<Email />}
                      size="large"
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: "bold",
                        boxShadow: theme.shadows[4],
                      }}
                    >
                      Add Email List
                    </Button>
                  </CardContent>
                  {uploadProgress > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 4 }}
                    />
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                {emails.length > 0 ? (
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    }}
                  >
                    <CardContent
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 3,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ mb: 2 }}
                      >
                        <Box>
                          <Typography variant="h6" component="div" gutterBottom>
                            Email List
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            <Chip
                              icon={<Email />}
                              label={`${emails.length} emails`}
                              color="primary"
                              variant="outlined"
                              sx={{
                                borderRadius: 1,
                                fontSize: "0.85rem",
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setEmails([])}
                            startIcon={<Delete />}
                            disabled={loading}
                            sx={{
                              borderRadius: 6,
                              textTransform: "none",
                              borderColor: alpha(theme.palette.error.main, 0.5),
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyBulk}
                            disabled={emails.length === 0 || loading}
                            startIcon={
                              loading ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <CheckCircle />
                              )
                            }
                            sx={{
                              borderRadius: 6,
                              textTransform: "none",
                              fontWeight: "bold",
                              px: 3,
                            }}
                          >
                            {loading ? "Verifying..." : "Verify All"}
                          </Button>
                        </Stack>
                      </Stack>

                      <Paper
                        variant="outlined"
                        sx={{
                          maxHeight: 200,
                          overflow: "auto",
                          mb: 2,
                          borderRadius: 1.5,
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.6
                          ),
                        }}
                      >
                        <List dense disablePadding>
                          {emails.map((email, idx) => (
                            <EmailListItem
                              key={idx}
                              email={email}
                              status="Pending"
                              icon={
                                <Email color="action" sx={{ opacity: 0.6 }} />
                              }
                              color={theme.palette.text.secondary}
                              onDelete={handleDeleteEmail}
                            />
                          ))}
                        </List>
                      </Paper>

                      <Box sx={{ mt: "auto" }}>
                        <Alert
                          severity="info"
                          variant="outlined"
                          icon={<Assessment />}
                          sx={{
                            borderRadius: 1.5,
                            alignItems: "center",
                            backgroundColor: alpha(
                              theme.palette.info.light,
                              0.1
                            ),
                          }}
                        >
                          <Typography variant="body2">
                            Ready to verify {emails.length} emails. Verification
                            checks syntax, domain validity, and mailbox
                            existence.
                          </Typography>
                        </Alert>
                      </Box>
                    </CardContent>
                    {loading && verificationProgress > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={verificationProgress}
                        sx={{ height: 4 }}
                      />
                    )}
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
                      borderRadius: 2,
                      p: 4,
                      backgroundColor: alpha(
                        theme.palette.background.default,
                        0.6
                      ),
                      border: `1px dashed ${alpha(theme.palette.divider, 0.7)}`,
                    }}
                  >
                    <InsertDriveFile
                      sx={{
                        fontSize: 60,
                        color: alpha(theme.palette.text.secondary, 0.5),
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      align="center"
                      gutterBottom
                    >
                      No emails added yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ mb: 3, maxWidth: 300 }}
                    >
                      Upload a CSV file to get started
                    </Typography>
                  </Card>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>

      {loading && (
        <Fade in={loading}>
          <Box sx={{ textAlign: "center", my: 6, py: 4 }}>
            <CircularProgress size={70} thickness={4} />
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="h6">
                Verifying {emails.length} Emails
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Checking syntax, domain validity, and deliverability
              </Typography>
            </Box>
            {verificationProgress > 0 && (
              <Box sx={{ width: "70%", mx: "auto", mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={verificationProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {Math.round(verificationProgress)}% Complete
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {results && (
        <Fade in={Boolean(results)}>
          <Box sx={{ mt: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 4,
                background: `linear-gradient(to bottom, ${alpha(
                  theme.palette.background.paper,
                  0.9
                )}, ${theme.palette.background.paper})`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Verification Results
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete analysis of {summary.total} email addresses
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<RestartAlt />}
                  onClick={resetVerification}
                  sx={{ borderRadius: 6, textTransform: "none" }}
                >
                  New Verification
                </Button>
              </Box>

              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(145deg, ${alpha(
                        theme.palette.success.light,
                        0.15
                      )}, ${alpha(theme.palette.success.light, 0.05)})`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: alpha(theme.palette.success.main, 0.1),
                        zIndex: 0,
                      }}
                    />
                    <CardContent sx={{ position: "relative", zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        color="text.secondary"
                      >
                        Valid Emails
                      </Typography>
                      <Typography
                        variant="h3"
                        color="success.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {summary.valid}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {((summary.valid / summary.total) * 100).toFixed(1)}%
                          of total
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(145deg, ${alpha(
                        theme.palette.warning.light,
                        0.15
                      )}, ${alpha(theme.palette.warning.light, 0.05)})`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: alpha(theme.palette.warning.main, 0.1),
                        zIndex: 0,
                      }}
                    />
                    <CardContent sx={{ position: "relative", zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        color="text.secondary"
                      >
                        Risky Emails
                      </Typography>
                      <Typography
                        variant="h3"
                        color="warning.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {summary.risky}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {((summary.risky / summary.total) * 100).toFixed(1)}%
                          of total
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(145deg, ${alpha(
                        theme.palette.error.light,
                        0.15
                      )}, ${alpha(theme.palette.error.light, 0.05)})`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: alpha(theme.palette.error.main, 0.1),
                        zIndex: 0,
                      }}
                    />
                    <CardContent sx={{ position: "relative", zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ color: "black" }}
                      >
                        Invalid Emails ({invalidEmails.length})
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 600, color: "black" }}
                      >
                        {summary.invalid}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {((summary.invalid / summary.total) * 100).toFixed(1)}
                          % of total
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(145deg, ${alpha(
                        theme.palette.primary.light,
                        0.15
                      )}, ${alpha(theme.palette.primary.light, 0.05)})`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: alpha(theme.palette.primary.main, 0.1),
                        zIndex: 0,
                      }}
                    />
                    <CardContent sx={{ position: "relative", zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        color="text.secondary"
                      >
                        Total Processed
                      </Typography>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {summary.total}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Verification complete
                        </Typography>
                        <CloudDone
                          sx={{
                            ml: 1,
                            color: theme.palette.primary.main,
                            fontSize: 18,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Visualization */}
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: `0 8px 25px ${alpha(
                    theme.palette.common.black,
                    0.05
                  )}`,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 3 }}>
                          Email Validation Summary
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              bgcolor: theme.palette.success.main,
                              mr: 1.5,
                              borderRadius: "50%",
                              boxShadow: `0 0 0 3px ${alpha(
                                theme.palette.success.main,
                                0.2
                              )}`,
                            }}
                          />
                          <Typography variant="body1" sx={{ mr: 2, flex: 1 }}>
                            Valid
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{ minWidth: 100, textAlign: "right" }}
                          >
                            {summary.valid} (
                            {((summary.valid / summary.total) * 100).toFixed(1)}
                            %)
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              bgcolor: theme.palette.warning.main,
                              mr: 1.5,
                              borderRadius: "50%",
                              boxShadow: `0 0 0 3px ${alpha(
                                theme.palette.warning.main,
                                0.2
                              )}`,
                            }}
                          />
                          <Typography variant="body1" sx={{ mr: 2, flex: 1 }}>
                            Risky
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{ minWidth: 100, textAlign: "right" }}
                          >
                            {summary.risky} (
                            {((summary.risky / summary.total) * 100).toFixed(1)}
                            %)
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              bgcolor: theme.palette.error.main,
                              mr: 1.5,
                              borderRadius: "50%",
                              boxShadow: `0 0 0 3px ${alpha(
                                theme.palette.error.main,
                                0.2
                              )}`,
                            }}
                          />
                          <Typography variant="body1" sx={{ mr: 2, flex: 1 }}>
                            Invalid
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{ minWidth: 100, textAlign: "right" }}
                          >
                            {summary.invalid} (
                            {((summary.invalid / summary.total) * 100).toFixed(
                              1
                            )}
                            %)
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2, opacity: 0.6 }} />
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            Total processed: {summary.total} emails
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={7}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <EmailResultsChart summary={summary} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Detailed Results Accordions */}
              <Box
                id="detailed-results"
                sx={{ mt: 4, scrollMarginTop: "100px" }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  gutterBottom
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    position: "relative",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      width: "60px",
                      height: "3px",
                      backgroundColor: theme.palette.primary.main,
                      bottom: "-8px",
                      left: 0,
                      borderRadius: "2px",
                    },
                  }}
                >
                  Detailed Results
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <FilterList
                    sx={{ mr: 1, color: theme.palette.text.secondary }}
                    fontSize="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Filter results by status
                  </Typography>
                </Box>

                {validEmails.length > 0 && (
                  <Zoom in timeout={300} style={{ transitionDelay: "100ms" }}>
                    <StyledAccordion
                      expanded={activeAccordion === "valid"}
                      onChange={handleAccordionChange("valid")}
                      bgcolor={theme.palette.success.light}
                    >
                      <StyledAccordionSummary
                        expandIcon={
                          <ExpandMore
                            sx={{
                              color: theme.palette.getContrastText(
                                theme.palette.success.light
                              ),
                            }}
                          />
                        }
                      >
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CheckCircle sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight="medium">
                              Valid Emails ({validEmails.length})
                            </Typography>
                          </Box>
                          <DownloadButton
                            onClick={() => downloadEmails(validEmails, "valid")}
                          />
                        </Box>
                      </StyledAccordionSummary>
                      <StyledAccordionDetails>
                        <List
                          disablePadding
                          sx={{
                            maxHeight: "350px",
                            overflow: "auto",
                            scrollbarWidth: "thin",
                            "&::-webkit-scrollbar": { width: "6px" },
                            "&::-webkit-scrollbar-track": {
                              background: alpha(
                                theme.palette.common.black,
                                0.05
                              ),
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: alpha(
                                theme.palette.common.black,
                                0.15
                              ),
                              borderRadius: "3px",
                            },
                          }}
                        >
                          {validEmails.map((item, idx) => (
                            <EmailListItem
                              key={idx}
                              email={item.email}
                              status="Valid"
                              icon={
                                <CheckCircle
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              color={theme.palette.success.main}
                              onDelete={null}
                            />
                          ))}
                        </List>
                      </StyledAccordionDetails>
                    </StyledAccordion>
                  </Zoom>
                )}

                {riskyEmails.length > 0 && (
                  <Zoom in timeout={300} style={{ transitionDelay: "150ms" }}>
                    <StyledAccordion
                      expanded={activeAccordion === "risky"}
                      onChange={handleAccordionChange("risky")}
                      bgcolor={theme.palette.warning.light}
                    >
                      <StyledAccordionSummary
                        expandIcon={
                          <ExpandMore
                            sx={{
                              color: theme.palette.getContrastText(
                                theme.palette.warning.light
                              ),
                            }}
                          />
                        }
                      >
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Warning sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight="medium">
                              Risky Emails ({riskyEmails.length})
                            </Typography>
                          </Box>
                          <DownloadButton
                            onClick={() => downloadEmails(riskyEmails, "risky")}
                          />
                        </Box>
                      </StyledAccordionSummary>
                      <StyledAccordionDetails>
                        <List
                          disablePadding
                          sx={{
                            maxHeight: "350px",
                            overflow: "auto",
                            scrollbarWidth: "thin",
                            "&::-webkit-scrollbar": { width: "6px" },
                            "&::-webkit-scrollbar-track": {
                              background: alpha(
                                theme.palette.common.black,
                                0.05
                              ),
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: alpha(
                                theme.palette.common.black,
                                0.15
                              ),
                              borderRadius: "3px",
                            },
                          }}
                        >
                          {riskyEmails.map((item, idx) => (
                            <EmailListItem
                              key={idx}
                              email={item.email}
                              status="Risky"
                              icon={
                                <Warning
                                  sx={{ color: theme.palette.warning.main }}
                                />
                              }
                              color={theme.palette.warning.main}
                              onDelete={null}
                            />
                          ))}
                        </List>
                      </StyledAccordionDetails>
                    </StyledAccordion>
                  </Zoom>
                )}

                {invalidEmails.length > 0 && (
                  <Zoom in timeout={300} style={{ transitionDelay: "200ms" }}>
                    <StyledAccordion
                      expanded={activeAccordion === "invalid"}
                      onChange={handleAccordionChange("invalid")}
                      bgcolor={theme.palette.error.light}
                    >
                      <StyledAccordionSummary
                        expandIcon={
                          <ExpandMore
                            sx={{
                              color: theme.palette.getContrastText(
                                theme.palette.error.light
                              ),
                            }}
                          />
                        }
                      >
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Error sx={{ mr: 1, color: "black" }} />
                            <Typography
                              variant="subtitle1"
                              fontWeight="medium"
                              sx={{ color: "black" }}
                            >
                              Invalid Emails ({invalidEmails.length})
                            </Typography>
                          </Box>
                          <DownloadButton
                            onClick={() =>
                              downloadEmails(invalidEmails, "invalid")
                            }
                          />
                        </Box>
                      </StyledAccordionSummary>
                      <StyledAccordionDetails>
                        <List
                          disablePadding
                          sx={{
                            maxHeight: "350px",
                            overflow: "auto",
                            scrollbarWidth: "thin",
                            "&::-webkit-scrollbar": { width: "6px" },
                            "&::-webkit-scrollbar-track": {
                              background: alpha(
                                theme.palette.common.black,
                                0.05
                              ),
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: alpha(
                                theme.palette.common.black,
                                0.15
                              ),
                              borderRadius: "3px",
                            },
                          }}
                        >
                          {invalidEmails.map((item, idx) => (
                            <EmailListItem
                              key={idx}
                              email={item.email}
                              status="Invalid"
                              icon={<Error sx={{ color: "black" }} />}
                              color={"black"}
                              onDelete={null}
                            />
                          ))}
                        </List>
                      </StyledAccordionDetails>
                    </StyledAccordion>
                  </Zoom>
                )}
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}

      <AddListModal
        open={openModal}
        onClose={handleCloseModal}
        onListCreate={handleListCreate}
      />
    </Container>
  );
};

export default BulkEmailVerification;
