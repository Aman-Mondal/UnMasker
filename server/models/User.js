const mongoose = require('mongoose');
const { isInMemoryFallback, inMemoryStore, saveStoreToFile } = require('../config/db');

// Mongoose Schema for MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  stats: {
    totalAnalyzed: { type: Number, default: 0 },
    potentialThreats: { type: Number, default: 0 },
    confirmedMalicious: { type: Number, default: 0 },
    threatsBlocked: { type: Number, default: 0 },
    lastScanDate: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.model('User', userSchema);

// Hybrid Data Access Layer (Mongoose + In-Memory Fallback)
class UserDAO {
  static async findByEmail(email) {
    if (!isInMemoryFallback()) {
      return await MongooseUser.findOne({ email: email.toLowerCase() });
    }
    for (const u of inMemoryStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  static async findById(id) {
    if (!isInMemoryFallback()) {
      return await MongooseUser.findById(id).select('-password');
    }
    const u = inMemoryStore.users.get(String(id));
    if (!u) return null;
    const { password, ...safeUser } = u;
    return safeUser;
  }

  static async create({ name, email, password }) {
    if (!isInMemoryFallback()) {
      const user = new MongooseUser({ name, email, password });
      return await user.save();
    }
    const id = String(inMemoryStore.idCounter++);
    const newUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password,
      stats: {
        totalAnalyzed: 0,
        potentialThreats: 0,
        confirmedMalicious: 0,
        threatsBlocked: 0,
        lastScanDate: null
      },
      createdAt: new Date()
    };
    inMemoryStore.users.set(id, newUser);
    saveStoreToFile();
    return newUser;
  }

  static async updateStats(userId, { isThreat, isMalicious, isBlocked }) {
    if (!isInMemoryFallback()) {
      const inc = { 'stats.totalAnalyzed': 1 };
      if (isThreat) inc['stats.potentialThreats'] = 1;
      if (isMalicious) inc['stats.confirmedMalicious'] = 1;
      if (isBlocked) inc['stats.threatsBlocked'] = 1;

      return await MongooseUser.findByIdAndUpdate(
        userId,
        { $inc: inc, $set: { 'stats.lastScanDate': new Date() } },
        { new: true }
      ).select('-password');
    }

    const u = inMemoryStore.users.get(String(userId));
    if (u) {
      u.stats.totalAnalyzed += 1;
      if (isThreat) u.stats.potentialThreats += 1;
      if (isMalicious) u.stats.confirmedMalicious += 1;
      if (isBlocked) u.stats.threatsBlocked += 1;
      u.stats.lastScanDate = new Date();
      saveStoreToFile();
      return u;
    }
    return null;
  }
}

module.exports = UserDAO;
