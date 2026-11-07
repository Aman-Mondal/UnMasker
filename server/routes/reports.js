const express = require('express');
const ReportDAO = require('../models/Report');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Submit a community threat report
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { url, category, description } = req.body;

    if (!url || !category) {
      return res.status(400).json({ success: false, error: 'URL and threat category are required.' });
    }

    let domain = url.trim().toLowerCase();
    try {
      const parsed = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      domain = parsed.hostname;
    } catch (_) {
      domain = domain.replace(/^(https?:\/\/)?/, '').split('/')[0];
    }

    const report = await ReportDAO.create({
      domain,
      url,
      category,
      description: description || '',
      reporterId: req.user ? (req.user._id || req.user.id) : null
    });

    res.status(201).json({
      success: true,
      message: `Community threat report saved for ${domain}. Thank you for contributing to web safety!`,
      report: {
        id: report._id || report.id,
        domain: report.domain,
        category: report.category,
        description: report.description,
        createdAt: report.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `Failed to save report: ${err.message}` });
  }
});

// Retrieve community reports
router.get('/', async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const reports = await ReportDAO.getAll({ category, search, limit: Number(limit) || 50 });

    res.json({
      success: true,
      count: reports.length,
      reports: reports.map(r => ({
        id: r._id || r.id,
        domain: r.domain,
        url: r.url,
        category: r.category,
        description: r.description,
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `Failed to retrieve reports: ${err.message}` });
  }
});

module.exports = router;
