import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddListModal from "../components/AddListModal";
import axios from "axios";

const BulkEmailVerification = () => {
  const [openModal, setOpenModal] = useState(false);
  const [emails, setEmails] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleListCreate = (data) => {
    if (data.type === "file") {
      // For now, we simply log the file.
      console.log("File selected:", data.file);
      // TODO: Parse file contents if needed.
    } else if (data.type === "paste") {
      setEmails(data.emails);
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

  return (
    <Box>
      <Typography variant="h5" component="div" gutterBottom>
        Bulk Verification
      </Typography>
      <Button variant="contained" onClick={handleOpenModal}>
        Add List
      </Button>
      <Button
        variant="outlined"
        onClick={handleVerifyBulk}
        sx={{ ml: 2 }}
        disabled={emails.length === 0}
      >
        Verify All
      </Button>
      {loading && (
        <Box sx={{ textAlign: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {results && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Verification Results
          </Typography>
          {results.map((item, idx) => (
            <Typography key={idx}>
              {item.email} - {item.status}
            </Typography>
          ))}
        </Paper>
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
