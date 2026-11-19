const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isMongoConnected, readLocalDb, writeLocalDb } = require('../db');

// Mongoose Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  dob: { type: String, default: '' },
  course: { type: String, required: true },
  qualifyingScore: { type: String, default: '' },
  applicationNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  admissionStatus: { 
    type: String, 
    enum: ['Application Submitted', 'Under Review', 'Documents Verified', 'Offer Letter Issued', 'Admission Confirmed'], 
    default: 'Application Submitted' 
  },
  applicationFeeStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

// Unified Repository layer
const User = {
  // Find by Email
  findByEmail: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected()) {
      return await MongoUser.findOne({ email: cleanEmail });
    }
    const db = readLocalDb();
    return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  // Find by Application Number or Email
  findByIdentifier: async (identifier) => {
    const cleanId = identifier.trim();
    if (isMongoConnected()) {
      return await MongoUser.findOne({
        $or: [
          { email: cleanId.toLowerCase() },
          { applicationNumber: cleanId.toUpperCase() }
        ]
      });
    }
    const db = readLocalDb();
    return db.users.find(u => 
      u.email.toLowerCase() === cleanId.toLowerCase() || 
      (u.applicationNumber && u.applicationNumber.toUpperCase() === cleanId.toUpperCase())
    ) || null;
  },

  // Find by ID
  findById: async (id) => {
    if (isMongoConnected()) {
      return await MongoUser.findById(id);
    }
    const db = readLocalDb();
    return db.users.find(u => u._id === id || u.id === id) || null;
  },

  // Create new applicant / user
  create: async (userData) => {
    if (isMongoConnected()) {
      const newUser = new MongoUser(userData);
      return await newUser.save();
    }
    const db = readLocalDb();
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      ...userData,
      email: userData.email.toLowerCase().trim(),
      applicationNumber: userData.applicationNumber.toUpperCase(),
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  },

  // Update status or fields
  updateById: async (id, updates) => {
    if (isMongoConnected()) {
      return await MongoUser.findByIdAndUpdate(id, updates, { new: true });
    }
    const db = readLocalDb();
    const idx = db.users.findIndex(u => u._id === id || u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalDb(db);
      return db.users[idx];
    }
    return null;
  },

  // Seed demo student if empty
  seedDemoIfEmpty: async () => {
    const demoEmail = 'student@abes.ac.in';
    const existing = await User.findByEmail(demoEmail);
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Student@123', salt);
      await User.create({
        name: 'Aarav Sharma',
        email: demoEmail,
        phone: '+91 98765 43210',
        dob: '2005-08-14',
        course: 'B.Tech Computer Science & Engineering',
        qualifyingScore: '94.6%',
        applicationNumber: 'ADM-2026-1001',
        password: hashedPassword,
        role: 'student',
        admissionStatus: 'Under Review',
        applicationFeeStatus: 'Paid'
      });
      console.log('🎓 Seeded demo applicant: student@abes.ac.in / Student@123');
    }
  }
};

module.exports = User;
