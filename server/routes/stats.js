const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const ReportDAO = require('../models/Report');

const router = express.Router();

// Retrieve protection statistics (Brave Browser-style)
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      return res.json({
        success: true,
        type: 'user',
        stats: req.user.stats || {
          totalAnalyzed: 0,
          potentialThreats: 0,
          confirmedMalicious: 0,
          threatsBlocked: 0,
          lastScanDate: null
        }
      });
    }

    // Default unauthenticated baseline stats
    const allReports = await ReportDAO.getAll({ limit: 100 });
    res.json({
      success: true,
      type: 'guest',
      stats: {
        totalAnalyzed: 0,
        potentialThreats: 0,
        confirmedMalicious: 0,
        threatsBlocked: 0,
        communityReportsCount: allReports.length,
        lastScanDate: null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
