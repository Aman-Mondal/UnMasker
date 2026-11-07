const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Reference seed reports matching the design reference
const SEED_REPORTS = [
  {
    id: 'rep-1',
    _id: 'rep-1',
    domain: 'sbi-secure-login.com',
    url: 'https://sbi-secure-login.com',
    category: 'Phishing',
    riskLevel: 'High',
    reportsCount: 18,
    description: 'Fake SBI Internet banking credential harvesting portal.',
    createdAt: new Date('2026-11-07T15:48:00Z')
  },
  {
    id: 'rep-2',
    _id: 'rep-2',
    domain: 'amaz0n-support.net',
    url: 'https://amaz0n-support.net',
    category: 'Brand Impersonation',
    riskLevel: 'High',
    reportsCount: 12,
    description: 'Fake customer support number and gift-card payment scam.',
    createdAt: new Date('2026-11-07T14:30:00Z')
  },
  {
    id: 'rep-3',
    _id: 'rep-3',
    domain: 'paypa1-verification.com',
    url: 'https://paypa1-verification.com',
    category: 'Fake Payment Portal',
    riskLevel: 'High',
    reportsCount: 9,
    description: 'Typosquat payment confirmation scam harvesting card CVV.',
    createdAt: new Date('2026-11-06T18:20:00Z')
  },
  {
    id: 'rep-4',
    _id: 'rep-4',
    domain: 'flipkart-offers-login.in',
    url: 'https://flipkart-offers-login.in',
    category: 'Financial Fraud',
    riskLevel: 'Medium',
    reportsCount: 4,
    description: 'Fake anniversary giveaway link shared via messaging apps.',
    createdAt: new Date('2026-11-06T11:15:00Z')
  },
  {
    id: 'rep-5',
    _id: 'rep-5',
    domain: 'govt-schemes-apply.com',
    url: 'https://govt-schemes-apply.com',
    category: 'Other',
    riskLevel: 'Medium',
    reportsCount: 3,
    description: 'Fraudulent portal soliciting processing fees for welfare grants.',
    createdAt: new Date('2026-11-05T09:40:00Z')
  }
];

// Persistent File Storage Path
const STORAGE_FILE = path.join(__dirname, '..', 'data', 'local_store.json');

// In-memory fallback collection storage in case local mongod is not running
let isInMemoryFallback = false;
const inMemoryStore = {
  users: new Map(),
  reports: [...SEED_REPORTS],
  idCounter: 6
};

function saveStoreToFile() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const serialized = {
      users: Array.from(inMemoryStore.users.entries()),
      reports: inMemoryStore.reports,
      idCounter: inMemoryStore.idCounter
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(serialized, null, 2), 'utf8');
  } catch (_) {}
}

function loadStoreFromFile() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
      if (data.users && Array.isArray(data.users)) {
        inMemoryStore.users = new Map(data.users);
      }
      if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
        inMemoryStore.reports = data.reports;
      }
      if (data.idCounter) {
        inMemoryStore.idCounter = data.idCounter;
      }
    }
  } catch (_) {}
}

loadStoreFromFile();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unmasker';

  // Handle any background connection errors without crashing process
  mongoose.connection.on('error', (err) => {
    // Silently suppress reconnect noise if fallback is active
    if (!isInMemoryFallback) {
      console.warn(`[UnMasker Database] Mongoose connection error: ${err.message}`);
    }
  });

  try {
    // Attempt connecting to real MongoDB with a fast 1500ms timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`[UnMasker Database] Successfully connected to MongoDB at ${mongoURI}`);
    isInMemoryFallback = false;
  } catch (err) {
    console.warn(`[UnMasker Database] Local MongoDB daemon not reachable (${err.message}).`);
    console.log('[UnMasker Database] Activating resilient in-memory MongoDB store to ensure zero-downtime operation.');
    isInMemoryFallback = true;
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }
};

module.exports = {
  connectDB,
  isInMemoryFallback: () => isInMemoryFallback || mongoose.connection.readyState !== 1,
  inMemoryStore,
  saveStoreToFile
};
