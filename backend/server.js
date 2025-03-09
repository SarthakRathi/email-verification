// server.js
const express = require("express");
const cors = require("cors");
const dns = require("dns").promises;
const mailchecker = require("mailchecker");
const emailExistence = require("email-existence");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const checkDomain = async (domain) => {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) return true;
  } catch (err) {}
  try {
    const aRecords = await dns.resolve(domain, "A");
    if (aRecords && aRecords.length > 0) return true;
  } catch (err) {}
  return false;
};

const checkEmailSMTP = (email) => {
  return new Promise((resolve) => {
    emailExistence.check(email, (err, exists) => {
      if (err) return resolve(false);
      return resolve(exists);
    });
  });
};

app.post("/api/single-verify", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const isRegexValid = emailRegex.test(email);
  let domainValid = false;
  if (isRegexValid) {
    const domain = email.split("@")[1];
    domainValid = await checkDomain(domain);
  }
  const isDisposable = !mailchecker.isValid(email);
  let smtpValid = false;
  if (isRegexValid && domainValid && !isDisposable) {
    smtpValid = await checkEmailSMTP(email);
  }
  let status = "";
  let message = "";
  if (!isRegexValid) {
    status = "invalid";
    message = "Invalid email format";
  } else if (!domainValid) {
    status = "invalid";
    message = "Email format is valid, but domain not found";
  } else if (isDisposable) {
    status = "invalid";
    message = "Valid format and domain exist, but disposable email detected";
  } else if (smtpValid) {
    status = "valid";
    message = "Email is valid";
  } else {
    status = "risky";
    message = "Domain exists but SMTP verification failed, email is risky";
  }

  res.json({ email, status, message });
});

app.post("/api/bulk-verify", async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails)) return res.status(400).json({ error: "Emails should be an array" });
  const results = await Promise.all(
    emails.map(async (email) => {
      const isRegexValid = emailRegex.test(email);
      let domainValid = false;
      if (isRegexValid) {
        const domain = email.split("@")[1];
        domainValid = await checkDomain(domain);
      }
      const isDisposable = !mailchecker.isValid(email);
      let smtpValid = false;
      if (isRegexValid && domainValid && !isDisposable) {
        smtpValid = await checkEmailSMTP(email);
      }
      let status = "";
      let message = "";
      if (!isRegexValid) {
        status = "invalid";
        message = "Invalid email format";
      } else if (!domainValid) {
        status = "invalid";
        message = "Valid format but domain not found";
      } else if (isDisposable) {
        status = "invalid";
        message = "Valid format and domain exist, but disposable email detected";
      } else if (smtpValid) {
        status = "valid";
        message = "Email is valid";
      } else {
        status = "risky";
        message = "Domain exists but SMTP verification failed, email is risky";
      }
      return { email, status, message };
    })
  );
  res.json({ results });
});

// --- Mount Authentication Routes ---
const authRoutes = require("./auth");
app.use("/api", authRoutes);

// --- Mount User Routes ---
const userRoutes = require("./user");
app.use("/api", userRoutes);

// --- Mount Verification Batch (history) Routes ---
const historyRoutes = require("./history");
app.use("/api", historyRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
