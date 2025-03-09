// history.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

router.post('/verification-batch', async (req, res) => {
  try {
    const { user_id, batchTime, emails } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required and cannot be empty' });
    }
    
    // Insert a new batch record into verification_batches.
    const [batchResult] = await pool.query(
      'INSERT INTO verification_batches (user_id, batch_time) VALUES (?, ?)',
      [user_id || null, batchTime || new Date()]
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

// GET endpoint to fetch all batches with their results
router.get('/verification-batch', async (req, res) => {
  try {
    // Fetch all batches (most recent first)
    const [batches] = await pool.query('SELECT * FROM verification_batches ORDER BY batch_time DESC');
    
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

// In your history.js (Express router file)
router.delete('/verification-batch/:id', async (req, res) => {
    try {
      const batchId = req.params.id;
      
      // First, delete all associated verification results
      await pool.query(
        'DELETE FROM verification_results WHERE batch_id = ?',
        [batchId]
      );
      
      // Then, delete the batch record
      await pool.query(
        'DELETE FROM verification_batches WHERE id = ?',
        [batchId]
      );
      
      res.json({ message: 'Verification batch deleted successfully' });
    } catch (error) {
      console.error('Error deleting verification batch:', error);
      res.status(500).json({ error: 'Server error while deleting verification batch' });
    }
  });  

module.exports = router;
