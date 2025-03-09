// trends.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

router.get('/verification-trends', async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const userId = req.query.user_id;
    
    if (!userId || userId === "null") {
      return res.status(400).json({ error: "Invalid user_id" });
    }
    
    let startDate;
    if (range === '7d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === '30d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate = new Date(0);
    }

    let query = `
      SELECT DATE(vb.batch_time) as date, COALESCE(COUNT(vr.id), 0) as totalEmails
      FROM verification_batches vb
      LEFT JOIN verification_results vr ON vb.id = vr.batch_id
      WHERE vb.batch_time >= ? AND vb.user_id = ?
      GROUP BY DATE(vb.batch_time)
      ORDER BY DATE(vb.batch_time) ASC`;
    const params = [startDate, userId];

    const [rows] = await pool.query(query, params);
    const labels = rows.map((r) => r.date);
    const data = rows.map((r) => r.totalEmails);
    res.json({ labels, data });
  } catch (error) {
    console.error("Error fetching verification trends:", error);
    res.status(500).json({ error: "Error fetching verification trends" });
  }
});

module.exports = router;
