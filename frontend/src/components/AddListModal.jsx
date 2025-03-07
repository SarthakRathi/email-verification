import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

const AddListModal = ({ open, onClose, onListCreate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedEmails, setPastedEmails] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Count the number of emails in pasted text
  const getEmailCount = () => {
    if (!pastedEmails) return 0;
    return pastedEmails.split("\n").filter((line) => line.trim()).length;
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleCreateList = () => {
    if (tabValue === 0) {
      if (!selectedFile) {
        alert("Please select a file first");
        return;
      }
      onListCreate({ type: "file", file: selectedFile });
    } else {
      const lines = pastedEmails
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) {
        alert("Please paste at least one email address");
        return;
      }
      onListCreate({ type: "paste", emails: lines });
    }
    // Reset form
    setSelectedFile(null);
    setPastedEmails("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" component="div">
          Add Email List
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
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
            "& svg": {
              marginRight: "8px",
              marginBottom: "0px !important",
            },
          },
        }}
      >
        <Tab
          icon={<CloudUploadIcon />}
          label="Upload File"
          iconPosition="start"
        />
        <Tab icon={<ListAltIcon />} label="Paste Emails" iconPosition="start" />
      </Tabs>

      <DialogContent sx={{ py: 3 }}>
        {tabValue === 0 && (
          <Box sx={{ mt: 1 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
                borderRadius: 2,
                textAlign: "center",
                mb: 3,
                bgcolor: dragActive
                  ? "rgba(25, 118, 210, 0.04)"
                  : "transparent",
                transition: "all 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              component="label"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />

              <Box
                sx={{
                  width: 60,
                  height: 60,
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
              </Box>

              {selectedFile ? (
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    File Selected
                  </Typography>
                  <Chip
                    label={selectedFile.name}
                    variant="outlined"
                    color="primary"
                    onDelete={() => setSelectedFile(null)}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop File Here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    or click to browse files
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: CSV, TXT
                  </Typography>
                </Box>
              )}
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  "& svg": {
                    marginRight: "6px",
                    verticalAlign: "middle",
                  },
                }}
              >
                <FormatListNumberedIcon fontSize="small" /> Quick Tips
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 2 }}
              >
                <Chip size="small" label="CSV or TXT formats" />
                <Chip size="small" label="One email per line" />
                <Chip size="small" label="Max size: 10MB" />
              </Stack>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: 1 }}>
            <TextField
              multiline
              rows={8}
              fullWidth
              placeholder="Enter email addresses (one per line)"
              variant="outlined"
              sx={{ mb: 2 }}
              value={pastedEmails}
              onChange={(e) => setPastedEmails(e.target.value)}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "& svg": {
                    marginRight: "6px",
                    verticalAlign: "middle",
                  },
                }}
              >
                <FormatListNumberedIcon fontSize="small" /> Quick Tips
              </Typography>

              <Chip
                label={`${getEmailCount()} email(s)`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label="One email per line" />
              <Chip size="small" label="No commas or separators needed" />
              <Chip size="small" label="Max 1000 emails" />
            </Stack>
          </Box>
        )}
      </DialogContent>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateList}
          disabled={
            (tabValue === 0 && !selectedFile) ||
            (tabValue === 1 && getEmailCount() === 0)
          }
        >
          Add to List
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddListModal;
