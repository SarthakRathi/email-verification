// server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Simple email regex (you can refine as needed)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 1) Single Email Verification (Regex Only)
 */
app.post("/api/single-verify", (req, res) => {
  const { email } = req.body;

  // Basic validation
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Regex check
  const isValid = emailRegex.test(email);

  // For the sake of the UI, we can return a structure that helps display the result
  return res.json({
    email,
    status: isValid ? "valid" : "invalid",
    message: isValid ? "Regex passed" : "Regex failed",
  });
});

/**
 * 2) Bulk Email Verification (Regex Only)
 */
app.post("/api/bulk-verify", (req, res) => {
  const { emails } = req.body; // Expect an array of emails

  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: "Emails should be an array" });
  }

  // Map each email to a result object
  const results = emails.map((email) => {
    const isValid = emailRegex.test(email);
    return {
      email,
      status: isValid ? "valid" : "invalid",
    };
  });

  // Return an object or array that your frontend can consume
  return res.json({ results });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
