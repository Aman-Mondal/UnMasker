const express = require('express');
const axios = require('axios');
const UserDAO = require('../models/User');
const ReportDAO = require('../models/Report');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:5001';

// Scan URL route: Bridges Express backend and Python analysis API
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { url, blocked } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid website URL is required.' });
    }

    // Call Python Analysis API
    let pythonResponse;
    try {
      pythonResponse = await axios.post(`${PYTHON_API_URL}/analyze`, { url });
    } catch (pyErr) {
      const msg = pyErr.response?.data?.error || pyErr.message;
      return res.status(502).json({ 
        success: false, 
        error: `Python Analysis Engine error: ${msg}. Make sure python_service is running on port 5001.` 
      });
    }

    const analysisData = pythonResponse.data;
    const domain = analysisData.domain;

    // Fetch genuine Community Reports from MongoDB for this domain
    const communityReports = await ReportDAO.findByDomain(domain);

    // Merge community reports into the analysis payload
    analysisData.community_reports = communityReports;
    analysisData.community_reports_count = communityReports.length;
    analysisData.community_intel = {
      has_reports: communityReports.length > 0,
      report_count: communityReports.length,
      reports: communityReports
    };

    // If community reports exist, adjust classification if appropriate
    if (communityReports.length >= 3 && analysisData.risk_level === 'No Threat Detected') {
      analysisData.risk_level = 'Suspicious';
      analysisData.reasons.push(`Reported by ${communityReports.length} community users as suspicious`);
      analysisData.trust_score = Math.max(15, analysisData.trust_score - 30);
    }

    // Update user statistics in MongoDB if user is authenticated
    if (req.user) {
      const isThreat = analysisData.risk_level === 'Suspicious';
      const isMalicious = analysisData.risk_level === 'Confirmed Malicious';
      const isBlocked = Boolean(blocked || isMalicious);

      const updatedUser = await UserDAO.updateStats(req.user._id || req.user.id, {
        isThreat,
        isMalicious,
        isBlocked
      });

      analysisData.updatedUserStats = updatedUser ? updatedUser.stats : null;
    }

    res.json(analysisData);
  } catch (err) {
    res.status(500).json({ success: false, error: `Scan operation failed: ${err.message}` });
  }
});

// Explicit action endpoint to record a user actively blocking/preventing a threat
router.post('/record-block', requireAuth, async (req, res) => {
  try {
    const updated = await UserDAO.updateStats(req.user._id || req.user.id, {
      isThreat: false,
      isMalicious: false,
      isBlocked: true
    });
    res.json({ success: true, stats: updated.stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
