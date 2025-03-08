import React, { useState, useRef } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  ContentPaste as ContentPasteIcon,
  Description as DescriptionIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Delete as DeleteIcon,
  WarningAmber as WarningAmberIcon,
  Email as EmailIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const AddListModal = ({ open, onClose, onListCreate }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedEmails, setPastedEmails] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      simulateValidation();
    }
  };

  const getEmailCount = () => {
    if (!pastedEmails) return 0;
    return pastedEmails.split(/[\n,;]/).filter((line) => {
      const trimmed = line.trim();
      return trimmed && trimmed.includes("@");
    }).length;
  };

  const getInvalidLines = () => {
    if (!pastedEmails) return [];
    return pastedEmails
      .split(/[\n,;]/)
      .map((line) => line.trim())
      .filter((line) => line && !line.includes("@"))
      .slice(0, 3);
  };

  const invalidLines = getInvalidLines();
  const hasInvalidLines = invalidLines.length > 0;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      simulateValidation();
    }
  };

  const simulateValidation = () => {
    setValidating(true);
    setValidationProgress(0);
    const progressInterval = setInterval(() => {
      setValidationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setValidating(false);
            setValidationProgress(0);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
  };

  const handleCreateList = () => {
    if (tabValue === 0) {
      if (!selectedFile) {
        alert("Please select a file first");
        return;
      }
      onListCreate({ type: "file", file: selectedFile });
    } else {
      const emails = pastedEmails
        .split(/[\n,;]/)
        .map((line) => line.trim())
        .filter((line) => line && line.includes("@"));

      if (!emails.length) {
        alert("Please paste at least one valid email address");
        return;
      }
      onListCreate({ type: "paste", emails });
    }
    // Reset form
    setSelectedFile(null);
    setPastedEmails("");
    onClose();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedEmails(text);
        simulateValidation();
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2.5,
          px: 3,
          background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              mr: 1.5,
            }}
          >
            <FormatListBulletedIcon />
          </Avatar>
          <Typography variant="h6" component="div" fontWeight="bold">
            Add Email List
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            py: 1.5,
            fontSize: "0.95rem",
            fontWeight: 500,
            "& svg": {
              marginRight: "10px",
              marginBottom: "0px !important",
            },
            "&.Mui-selected": {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          },
        }}
      >
        <Tab
          icon={<CloudUploadIcon />}
          label="Upload File"
          iconPosition="start"
        />
        <Tab
          icon={<ContentPasteIcon />}
          label="Paste Emails"
          iconPosition="start"
        />
      </Tabs>

      <DialogContent sx={{ py: 3, px: 3 }}>
        {tabValue === 0 && (
          <Box sx={{ mt: 1 }}>
            <Paper
              variant="outlined"
              sx={{
                position: "relative",
                p: 3,
                border: dragActive
                  ? `2px dashed ${theme.palette.primary.main}`
                  : selectedFile
                  ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}`
                  : `2px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
                borderRadius: 3,
                textAlign: "center",
                mb: 3,
                bgcolor: dragActive
                  ? alpha(theme.palette.primary.main, 0.05)
                  : selectedFile
                  ? alpha(theme.palette.primary.light, 0.05)
                  : alpha(theme.palette.background.default, 0.5),
                transition: "all 0.25s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 220,
              }}
              component="div"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
                ref={fileInputRef}
              />

              {validating ? (
                <Fade in={validating}>
                  <Box sx={{ textAlign: "center", width: "100%", p: 2 }}>
                    <CircularProgress size={50} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Validating File
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Checking email format and structure...
                    </Typography>
                    <Box sx={{ width: "80%", mx: "auto", mt: 3 }}>
                      <LinearProgress
                        variant="determinate"
                        value={validationProgress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {Math.round(validationProgress)}% Complete
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ) : selectedFile ? (
                <Zoom in={Boolean(selectedFile)}>
                  <Box>
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: 30,
                        mb: 2,
                        mx: "auto",
                      }}
                    >
                      {selectedFile.name.endsWith(".csv") ? (
                        <DescriptionIcon sx={{ fontSize: 36 }} />
                      ) : (
                        <InsertDriveFileIcon sx={{ fontSize: 36 }} />
                      )}
                    </Avatar>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      gutterBottom
                      fontWeight="medium"
                    >
                      {selectedFile.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={selectedFile.name.split(".").pop().toUpperCase()}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      sx={{ mt: 1, borderRadius: 6, textTransform: "none" }}
                    >
                      Remove File
                    </Button>
                  </Box>
                </Zoom>
              ) : (
                <Box>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      mx: "auto",
                      border: `1px dashed ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: 48,
                        color: alpha(theme.palette.primary.main, 0.7),
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    Drag & Drop Your File Here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    or click to browse files
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{
                      mt: 2,
                      borderRadius: 6,
                      textTransform: "none",
                      px: 3,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select File
                  </Button>
                </Box>
              )}
              {dragActive && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    border: `2px dashed ${theme.palette.primary.main}`,
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary.main"
                    fontWeight="medium"
                  >
                    Drop File Here
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ position: "relative" }}>
              <TextField
                multiline
                rows={10}
                fullWidth
                placeholder="Enter email addresses (one per line or comma-separated)"
                variant="outlined"
                value={pastedEmails}
                onChange={(e) => {
                  setPastedEmails(e.target.value);
                  if (e.target.value.length > 10 && !validating) {
                    simulateValidation();
                  }
                }}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.5
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
              {!pastedEmails && (
                <Button
                  variant="outlined"
                  startIcon={<ContentPasteIcon />}
                  onClick={handlePaste}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    borderRadius: 6,
                    textTransform: "none",
                    fontSize: "0.8rem",
                  }}
                >
                  Paste
                </Button>
              )}
              {validating && (
                <LinearProgress
                  variant="determinate"
                  value={validationProgress}
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 0,
                    right: 0,
                    height: 4,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                  }}
                />
              )}
            </Box>
            {hasInvalidLines && (
              <Alert
                severity="warning"
                variant="outlined"
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Some lines don't appear to be valid emails:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {invalidLines.map((line, i) => (
                    <Typography component="li" variant="body2" key={i}>
                      "{line}"
                    </Typography>
                  ))}
                  {getInvalidLines().length > 3 && (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      ...and {getInvalidLines().length - 3} more
                    </Typography>
                  )}
                </Box>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: 3,
          borderTop: 1,
          borderColor: alpha(theme.palette.divider, 0.5),
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            mr: 1.5,
            borderRadius: 6,
            textTransform: "none",
            px: 3,
            borderColor: alpha(theme.palette.text.secondary, 0.3),
            color: theme.palette.text.secondary,
            "&:hover": {
              borderColor: alpha(theme.palette.text.secondary, 0.5),
              backgroundColor: alpha(theme.palette.text.secondary, 0.05),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateList}
          disabled={
            validating ||
            (tabValue === 0 && !selectedFile) ||
            (tabValue === 1 && getEmailCount() === 0)
          }
          startIcon={<CheckCircleIcon />}
          sx={{
            borderRadius: 6,
            textTransform: "none",
            px: 3,
            boxShadow: 2,
            fontWeight: "bold",
            minWidth: 120,
          }}
        >
          {validating ? "Validating..." : "Add to List"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddListModal;
