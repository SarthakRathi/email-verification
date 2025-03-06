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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AddListModal = ({ open, onClose, onListCreate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedEmails, setPastedEmails] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateList = () => {
    if (tabValue === 0) {
      if (!selectedFile) {
        alert("No file selected!");
        return;
      }
      onListCreate({ type: "file", file: selectedFile });
    } else {
      const lines = pastedEmails
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) {
        alert("No emails pasted!");
        return;
      }
      onListCreate({ type: "paste", emails: lines });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          Add List
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Upload File" />
        <Tab label="Paste Emails" />
      </Tabs>
      <DialogContent dividers>
        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Select or drag CSV file
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginBottom: "16px" }}
            />
            {selectedFile ? (
              <Typography variant="body2" color="text.secondary">
                Selected file: {selectedFile.name}
              </Typography>
            ) : (
              <Box
                sx={{
                  p: 2,
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  textAlign: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No file chosen yet
                </Typography>
              </Box>
            )}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Please Note
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1) CSV files up to 10Mb size are supported
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2) No limit on the number of emails in the file
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3) Emails are de-duplicated, so imported emails count might be
              less
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              4) Additional data columns present in the file will be retained
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              5) If multiple columns, the email column for verification should
              be last in the file
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              6) The uploaded file will be analyzed and ready for verification
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              7) Acceptable CSV file format (.csv)
            </Typography>
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Email addresses (one on each line)
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Enter up to 1000 emails"
              sx={{ mb: 2 }}
              value={pastedEmails}
              onChange={(e) => setPastedEmails(e.target.value)}
            />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Please Note
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1) Enter up to 1000 email addresses
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2) Enter only email addresses on each line
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3) If you need to include additional data, then try Upload File
              method
            </Typography>
          </Box>
        )}
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Button variant="contained" onClick={handleCreateList}>
          Create List
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddListModal;
