// trends.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

router.get('/verification-trends', async (req, res) => {
  try {
    // Get the range from the query, e.g., '7d', '30d', or 'all'
    const range = req.query.range || '7d';
    let startDate;

    if (range === '7d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === '30d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // If 'all', set startDate to epoch.
      startDate = new Date(0);
    }

    // Use LEFT JOIN and COALESCE to ensure a count of 0 when there are no matching emails.
    const [rows] = await pool.query(
      `SELECT DATE(vb.batch_time) as date, COALESCE(COUNT(vr.id), 0) as totalEmails
       FROM verification_batches vb
       LEFT JOIN verification_results vr ON vb.id = vr.batch_id
       WHERE vb.batch_time >= ?
       GROUP BY DATE(vb.batch_time)
       ORDER BY DATE(vb.batch_time) ASC`,
      [startDate]
    );

    const labels = rows.map((r) => r.date);
    const data = rows.map((r) => r.totalEmails);

    res.json({ labels, data });
  } catch (error) {
    console.error("Error fetching verification trends:", error);
    res.status(500).json({ error: "Error fetching verification trends" });
  }
});

module.exports = router;
