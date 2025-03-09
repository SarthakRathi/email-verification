// src/pages/VerificationHistory.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Badge,
  CircularProgress,
  Fade,
  Zoom,
  Collapse,
  Alert,
  AlertTitle,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(2),
  overflow: "hidden",
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:before": { display: "none" },
  "&.Mui-expanded": {
    margin: theme.spacing(0, 0, 2),
    boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.12)}`,
    transform: "translateY(-2px)",
    transition: theme.transitions.create(["box-shadow", "transform"], {
      duration: theme.transitions.duration.standard,
    }),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  "& .MuiAccordionSummary-content": { margin: theme.spacing(1, 0) },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxHeight: 200,
  overflowY: "auto",
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": {
    background: alpha(theme.palette.common.black, 0.05),
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.common.black, 0.15),
    borderRadius: "3px",
  },
}));

const StyledListItem = styled(ListItem)(({ theme, status }) => {
  let statusColor;
  switch (status) {
    case "valid":
      statusColor = theme.palette.success.main;
      break;
    case "risky":
      statusColor = theme.palette.warning.main;
      break;
    case "invalid":
      statusColor = theme.palette.error.main;
      break;
    default:
      statusColor = theme.palette.text.secondary;
  }
  return {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    padding: theme.spacing(1, 2),
    "&:last-child": { borderBottom: "none" },
    "&:hover": { backgroundColor: alpha(statusColor, 0.05) },
  };
});

const StatusChip = styled(Chip)(({ theme, statustype }) => {
  let chipStyles = {};
  switch (statustype) {
    case "valid":
      chipStyles = {
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.dark,
        fontWeight: 500,
        "& .MuiChip-icon": { color: theme.palette.success.main },
      };
      break;
    case "risky":
      chipStyles = {
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.dark,
        fontWeight: 500,
        "& .MuiChip-icon": { color: theme.palette.warning.main },
      };
      break;
    case "invalid":
      chipStyles = {
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.dark,
        fontWeight: 500,
        "& .MuiChip-icon": { color: theme.palette.error.main },
      };
      break;
    default:
      chipStyles = {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.dark,
        fontWeight: 500,
      };
  }
  return { ...chipStyles, height: 28, borderRadius: theme.shape.borderRadius };
});

const ExportButton = styled(Button)(({ theme }) => ({
  component: "span",
  borderRadius: 20,
  textTransform: "none",
  padding: theme.spacing(0.5, 1.5),
  fontSize: "0.8rem",
  boxShadow: "none",
  fontWeight: 500,
  "&:hover": { boxShadow: theme.shadows[1] },
}));

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const isoDateStr = dateStr.includes("T")
    ? dateStr
    : dateStr.replace(" ", "T");
  const date = new Date(isoDateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const VerificationHistory = () => {
  const theme = useTheme();
  const [historyData, setHistoryData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch history data from the backend on mount using token in headers.
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3001/api/verification-batch", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setHistoryData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching verification batches:", error);
        });
    }
  }, [token]);

  // Helper: compute summary counts for a batch.
  const getBatchSummary = (batch) => {
    const valid = batch.emails.filter((e) => e.status === "valid").length;
    const risky = batch.emails.filter((e) => e.status === "risky").length;
    const invalid = batch.emails.filter((e) => e.status === "invalid").length;
    const total = batch.emails.length;
    return { valid, risky, invalid, total };
  };

  // Function to export CSV data for a given category in a batch.
  const exportCSV = (emails, batch, category) => {
    if (!emails || emails.length === 0) return;
    const header = "Email,Status,Message,VerifiedAt";
    const rows = emails.map(
      (record) =>
        `"${record.email}","${record.status}","${record.message}","${batch.batch_time}"`
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTime = batch.batch_time.replace(/[:\s]/g, "_");
    link.href = url;
    link.setAttribute("download", `verification_${category}_${safeTime}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Function to handle deletion request.
  const handleDeleteRequest = (batchId) => {
    setBatchToDelete(batchId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Use token header for delete call.
      await axios.delete(
        `http://localhost:3001/api/verification-batch/${batchToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the deleted batch from the local state.
      const updatedHistory = historyData.filter(
        (batch) => batch.id !== batchToDelete
      );
      setHistoryData(updatedHistory);
      setDeleteDialogOpen(false);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting verification batch:", error);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    // Optional: add logic to control expansion
  };

  const getResultsSummary = (results) => {
    if (!results) return { valid: 0, invalid: 0, risky: 0, total: 0 };
    const valid = results.filter((r) => r.status === "valid").length;
    const invalid = results.filter((r) => r.status === "invalid").length;
    const risky = results.filter((r) => r.status === "risky").length;
    const total = results.length;
    return { valid, invalid, risky, total };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            Verification History
          </Typography>
          <Typography variant="subtitle1">
            View and manage your email verification batch history
          </Typography>
        </Box>
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
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  >
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Verification Batches
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have {historyData.length} verification{" "}
                      {historyData.length === 1 ? "batch" : "batches"} in your
                      history
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <Chip
                    icon={<FormatListBulletedIcon />}
                    label={`${historyData.reduce(
                      (sum, batch) => sum + batch.emails.length,
                      0
                    )} Total Emails`}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip
                    icon={<EventIcon />}
                    label={`${historyData.length} Batches`}
                    color="secondary"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>

      <Collapse in={deleteSuccess}>
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: `0 2px 10px ${alpha(theme.palette.success.main, 0.15)}`,
          }}
        >
          <AlertTitle>Success</AlertTitle>
          Verification batch has been successfully deleted
        </Alert>
      </Collapse>

      {historyData.length > 0 ? (
        historyData.map((batch) => {
          const summary = getResultsSummary(batch.emails);
          const validEmails = batch.emails.filter((e) => e.status === "valid");
          const riskyEmails = batch.emails.filter((e) => e.status === "risky");
          const invalidEmails = batch.emails.filter(
            (e) => e.status === "invalid"
          );

          return (
            <Zoom
              key={batch.id}
              in={true}
              style={{
                transitionDelay: `${
                  historyData.findIndex((b) => b.id === batch.id) * 100
                }ms`,
              }}
            >
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            width: 40,
                            height: 40,
                            mr: 2,
                          }}
                        >
                          <VisibilityIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {formatDate(batch.batch_time)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {summary.total} emails
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <StatusChip
                          label={`${summary.valid} Valid`}
                          statustype="valid"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                        <StatusChip
                          label={`${summary.risky} Risky`}
                          statustype="risky"
                          size="small"
                          icon={<WarningIcon />}
                        />
                        <StatusChip
                          label={`${summary.invalid} Invalid`}
                          statustype="invalid"
                          size="small"
                          icon={<ErrorIcon />}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={1}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Tooltip title="Delete Batch">
                        <IconButton
                          component="span" // Overrides the default "button" element
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(batch.id);
                          }}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: { xs: 3, md: 0 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              color: theme.palette.success.dark,
                            }}
                          >
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ mr: 0.8 }}
                            />
                            Valid Emails ({validEmails.length})
                          </Typography>
                          <ExportButton
                            variant="outlined"
                            size="small"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCSV(validEmails, batch, "valid");
                            }}
                            disabled={validEmails.length === 0}
                          >
                            Export
                          </ExportButton>
                        </Box>
                        <StyledPaper>
                          {validEmails.length ? (
                            <List disablePadding>
                              {validEmails.map((record, idx) => (
                                <StyledListItem key={idx} status="valid">
                                  <ListItemText
                                    primary={record.email}
                                    secondary={record.message}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                      fontWeight: 500,
                                    }}
                                    secondaryTypographyProps={{
                                      variant: "caption",
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                </StyledListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ p: 2, textAlign: "center" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No valid emails in this batch.
                              </Typography>
                            </Box>
                          )}
                        </StyledPaper>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: { xs: 3, md: 0 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              color: theme.palette.warning.dark,
                            }}
                          >
                            <WarningIcon fontSize="small" sx={{ mr: 0.8 }} />
                            Risky Emails ({riskyEmails.length})
                          </Typography>
                          <ExportButton
                            variant="outlined"
                            size="small"
                            color="warning"
                            startIcon={<DownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCSV(riskyEmails, batch, "risky");
                            }}
                            disabled={riskyEmails.length === 0}
                          >
                            Export
                          </ExportButton>
                        </Box>
                        <StyledPaper>
                          {riskyEmails.length ? (
                            <List disablePadding>
                              {riskyEmails.map((record, idx) => (
                                <StyledListItem key={idx} status="risky">
                                  <ListItemText
                                    primary={record.email}
                                    secondary={record.message}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                      fontWeight: 500,
                                    }}
                                    secondaryTypographyProps={{
                                      variant: "caption",
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                </StyledListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ p: 2, textAlign: "center" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No risky emails in this batch.
                              </Typography>
                            </Box>
                          )}
                        </StyledPaper>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              color: theme.palette.error.dark,
                            }}
                          >
                            <ErrorIcon fontSize="small" sx={{ mr: 0.8 }} />
                            Invalid Emails ({invalidEmails.length})
                          </Typography>
                          <ExportButton
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCSV(invalidEmails, batch, "invalid");
                            }}
                            disabled={invalidEmails.length === 0}
                          >
                            Export
                          </ExportButton>
                        </Box>
                        <StyledPaper>
                          {invalidEmails.length ? (
                            <List disablePadding>
                              {invalidEmails.map((record, idx) => (
                                <StyledListItem key={idx} status="invalid">
                                  <ListItemText
                                    primary={record.email}
                                    secondary={record.message}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                      fontWeight: 500,
                                    }}
                                    secondaryTypographyProps={{
                                      variant: "caption",
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                </StyledListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ p: 2, textAlign: "center" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No invalid emails in this batch.
                              </Typography>
                            </Box>
                          )}
                        </StyledPaper>
                      </Box>
                    </Grid>
                  </Grid>
                </StyledAccordionDetails>
              </StyledAccordion>
            </Zoom>
          );
        })
      ) : (
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              borderStyle: "dashed",
              borderColor: alpha(theme.palette.divider, 0.6),
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <HistoryIcon
              sx={{
                fontSize: 60,
                color: alpha(theme.palette.text.secondary, 0.4),
                mb: 1,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Verification History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't verified any email batches yet or all batches have
              been deleted.
            </Typography>
          </Paper>
        </Fade>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: theme.shadows[10] } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Verification Batch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this verification batch? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 20, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: 20, textTransform: "none" }}
            startIcon={<DeleteIcon />}
          >
            Delete Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VerificationHistory;
