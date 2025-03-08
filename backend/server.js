// server.js
const express = require("express");
const cors = require("cors");
const dns = require("dns").promises; // Promise-based DNS module
const mailchecker = require("mailchecker"); // For disposable email detection
const emailExistence = require("email-existence"); // For SMTP verification
const pool = require('./db'); // MySQL connection pool

const app = express();
app.use(cors());
app.use(express.json());

// Basic email format regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to check domain validity with fallback
const checkDomain = async (domain) => {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // Ignore MX lookup errors
  }
  
  try {
    const aRecords = await dns.resolve(domain, "A");
    if (aRecords && aRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // Ignore A record lookup errors
  }
  
  return false;
};

// Function to perform SMTP verification using email-existence
const checkEmailSMTP = (email) => {
  return new Promise((resolve) => {
    emailExistence.check(email, function (err, exists) {
      if (err) return resolve(false);
      return resolve(exists);
    });
  });
};

// ===== Single Email Verification Endpoint =====
app.post("/api/single-verify", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // 1. Check email format
  const isRegexValid = emailRegex.test(email);

  // 2. Check domain validity if format is valid
  let domainValid = false;
  if (isRegexValid) {
    const domain = email.split("@")[1];
    domainValid = await checkDomain(domain);
  }

  // 3. Check if email is disposable (mailchecker.isValid returns true if NOT disposable)
  const isDisposable = !mailchecker.isValid(email);

  // 4. Perform SMTP verification if previous checks pass
  let smtpValid = false;
  if (isRegexValid && domainValid && !isDisposable) {
    smtpValid = await checkEmailSMTP(email);
  }

  // Determine final status and message
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

  // Log the verification result into the database
  try {
    await pool.query(
      'INSERT INTO verifications (email, status, message) VALUES (?, ?, ?)',
      [email, status, message]
    );
  } catch (dbError) {
    console.error("Error logging verification:", dbError);
  }

  return res.json({ email, status, message });
});

// ===== Bulk Email Verification Endpoint =====
app.post("/api/bulk-verify", async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: "Emails should be an array" });
  }

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
      
      // Log each verification result into the database
      try {
        await pool.query(
          'INSERT INTO verifications (email, status, message) VALUES (?, ?, ?)',
          [email, status, message]
        );
      } catch (dbError) {
        console.error(`Error logging verification for ${email}:`, dbError);
      }
      
      return { email, status, message };
    })
  );

  return res.json({ results });
});

// ===== Mount Authentication Routes =====
const authRoutes = require('./auth');
app.use("/api", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
