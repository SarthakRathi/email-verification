const express = require("express");
const cors = require("cors");
const dns = require("dns").promises; // Promise-based DNS module
const mailchecker = require("mailchecker"); // For disposable email detection
const emailExistence = require("email-existence"); // For SMTP verification

const app = express();
app.use(cors());
app.use(express.json());

// Basic email format regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to check domain validity with fallback
const checkDomain = async (domain) => {
  // Try to resolve MX records first
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // If MX lookup fails, move on to A record check
  }
  
  // Fallback: try to resolve A records
  try {
    const aRecords = await dns.resolve(domain, "A");
    if (aRecords && aRecords.length > 0) {
      return true;
    }
  } catch (err) {
    // A record lookup failed
  }
  
  // Neither MX nor A records found – domain is likely invalid
  return false;
};

// Function to perform SMTP verification using email-existence
const checkEmailSMTP = (email) => {
  return new Promise((resolve) => {
    emailExistence.check(email, function (err, exists) {
      // In case of error, assume the SMTP check failed
      if (err) {
        return resolve(false);
      }
      return resolve(exists);
    });
  });
};

// Single Email Verification Endpoint with SMTP Verification
// Single Email Verification Endpoint with SMTP Verification and Risk Category
app.post("/api/single-verify", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // 1. Check email format with regex
  const isRegexValid = emailRegex.test(email);

  // 2. Check the domain's DNS records if regex passes
  let domainValid = false;
  if (isRegexValid) {
    const domain = email.split("@")[1];
    domainValid = await checkDomain(domain);
  }

  // 3. Check if the email is disposable using mailchecker
  // mailchecker.isValid(email) returns true if the email is NOT disposable.
  const isDisposable = !mailchecker.isValid(email);

  // 4. Perform SMTP verification only if previous checks pass
  let smtpValid = false;
  if (isRegexValid && domainValid && !isDisposable) {
    smtpValid = await checkEmailSMTP(email);
  }

  // Determine final status
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
    status = "risky";  // <-- Make sure this branch sets status to "risky"
    message = "Domain exists but SMTP verification failed, email is risky";
  }

  return res.json({
    email,
    status,
    message,
  });
});

// Bulk Email Verification Endpoint with SMTP Verification and Risk Category
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

      return {
        email,
        status,
        message,
      };
    })
  );

  return res.json({ results });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
