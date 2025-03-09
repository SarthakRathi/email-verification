// history.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const authenticateToken = require('./authenticateToken');

// POST /api/verification-batch - Save a new verification batch
router.post('/verification-batch', authenticateToken, async (req, res) => {
  try {
    const { batchTime, emails } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required and cannot be empty' });
    }
    
    // Use the authenticated user's ID from the token
    const user_id = req.user.id;
    
    // Insert a new batch record into verification_batches.
    const [batchResult] = await pool.query(
      'INSERT INTO verification_batches (user_id, batch_time) VALUES (?, ?)',
      [user_id, batchTime || new Date()]
    );
    const batchId = batchResult.insertId;
    
    // Prepare values for a bulk insert into verification_results.
    const values = emails.map(emailObj => [
      batchId,
      emailObj.email,
      emailObj.status,
      emailObj.verified_at || new Date()
    ]);
    
    // Bulk insert the email records.
    await pool.query(
      'INSERT INTO verification_results (batch_id, email, status, verified_at) VALUES ?',
      [values]
    );
    
    return res.json({ message: 'Verification batch saved successfully', batchId });
  } catch (error) {
    console.error('Error saving verification batch:', error);
    return res.status(500).json({ error: 'Server error while saving verification batch' });
  }
});

// GET /api/verification-batch - Fetch all batches for the authenticated user
router.get('/verification-batch', authenticateToken, async (req, res) => {
  try {
    // Get the user ID from the token
    const userId = req.user.id;
    
    const [batches] = await pool.query(
      'SELECT * FROM verification_batches WHERE user_id = ? ORDER BY batch_time DESC',
      [userId]
    );
    
    // For each batch, fetch its email records
    for (let batch of batches) {
      const [results] = await pool.query(
        'SELECT email, status, verified_at FROM verification_results WHERE batch_id = ?',
        [batch.id]
      );
      batch.emails = results;
    }
    res.json(batches);
  } catch (error) {
    console.error("Error fetching verification batches:", error);
    res.status(500).json({ error: "Error fetching verification batches" });
  }
});

// DELETE /api/verification-batch/:id - Delete a batch if it belongs to the authenticated user
router.delete('/verification-batch/:id', authenticateToken, async (req, res) => {
  try {
    const batchId = req.params.id;
    
    // Verify that the batch belongs to the authenticated user
    const [batch] = await pool.query('SELECT user_id FROM verification_batches WHERE id = ?', [batchId]);
    if (batch.length === 0 || batch[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this batch" });
    }
    
    // Delete associated verification results first
    await pool.query('DELETE FROM verification_results WHERE batch_id = ?', [batchId]);
    
    // Then, delete the batch record
    await pool.query('DELETE FROM verification_batches WHERE id = ?', [batchId]);
    
    res.json({ message: 'Verification batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting verification batch:', error);
    res.status(500).json({ error: 'Server error while deleting verification batch' });
  }
});

module.exports = router;
