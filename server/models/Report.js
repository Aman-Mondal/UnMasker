const mongoose = require('mongoose');
const { isInMemoryFallback, inMemoryStore, saveStoreToFile } = require('../config/db');

const reportSchema = new mongoose.Schema({
  domain: { type: String, required: true, index: true },
  url: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Phishing', 'Financial Fraud', 'Fake Payment Portal', 'Brand Impersonation', 'Malware', 'Other']
  },
  description: { type: String, default: '' },
  reporterId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const MongooseReport = mongoose.model('Report', reportSchema);

class ReportDAO {
  static async create(data) {
    if (!isInMemoryFallback()) {
      const rep = new MongooseReport(data);
      return await rep.save();
    }
    const id = String(inMemoryStore.idCounter++);
    const newReport = {
      _id: id,
      id,
      domain: data.domain.toLowerCase(),
      url: data.url,
      category: data.category,
      description: data.description || '',
      reporterId: data.reporterId || null,
      createdAt: new Date()
    };
    inMemoryStore.reports.unshift(newReport);
    saveStoreToFile();
    return newReport;
  }

  static async findByDomain(domain) {
    const clean = domain.toLowerCase();
    if (!isInMemoryFallback()) {
      return await MongooseReport.find({ domain: clean }).sort({ createdAt: -1 });
    }
    return inMemoryStore.reports.filter(r => r.domain === clean);
  }

  static async getAll({ category, search, limit = 50 }) {
    if (!isInMemoryFallback()) {
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (search) {
        filter.$or = [
          { domain: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      return await MongooseReport.find(filter).sort({ createdAt: -1 }).limit(limit);
    }

    let results = [...inMemoryStore.reports];
    if (category && category !== 'all') {
      results = results.filter(r => r.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r => r.domain.includes(q) || r.description.toLowerCase().includes(q));
    }
    return results.slice(0, limit);
  }
}

module.exports = ReportDAO;
