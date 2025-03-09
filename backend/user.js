// user.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const bcrypt = require('bcrypt');
const authenticateToken = require('./authenticateToken');

// GET /api/user - Fetch current user details
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, fullName, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/user - Update user details
router.put('/user', authenticateToken, async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName && !email && !password) {
    return res.status(400).json({ error: "At least one field must be provided to update" });
  }
  try {
    let fields = [];
    let values = [];
    if (fullName) {
      fields.push("fullName = ?");
      values.push(fullName);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      fields.push("password = ?");
      values.push(hashedPassword);
    }
    values.push(req.user.id);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
