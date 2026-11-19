const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;
const DB_FILE = path.join(__dirname, 'admission_db.json');

// Initialize JSON database if needed
const initLocalDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      applications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

const readLocalDb = () => {
  try {
    initLocalDb();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return { users: [], applications: [] };
  }
};

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admission_portal';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at ' + mongoURI);
  } catch (error) {
    isMongoConnected = false;
    console.log('ℹ️  MongoDB not running locally (' + error.message + ').');
    console.log('⚡ Using built-in persistent storage engine for admission portal data.');
    initLocalDb();
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  readLocalDb,
  writeLocalDb
};
