const dns = require('dns');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMock = false;
const publicDnsServers = ['1.1.1.1', '8.8.8.8'];

const connectWithUri = (uri) => {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
};

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('⚠️ Using local JSON-file Database (Mock Mode). MongoDB not required.');
    isMock = true;
    initializeMockDB();
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management';
    const conn = await connectWithUri(mongoUri);
    isMock = false;
    process.env.USE_MOCK_DB = 'false';
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management';
    const shouldRetryWithPublicDns = mongoUri.startsWith('mongodb+srv://') && /querySrv|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(error.message);

    if (shouldRetryWithPublicDns) {
      try {
        dns.setServers(publicDnsServers);
        console.log('⚠️ Retrying MongoDB connection with public DNS resolvers...');

        const conn = await connectWithUri(mongoUri);
        isMock = false;
        process.env.USE_MOCK_DB = 'false';
        console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (retryError) {
        error = retryError;
      }
    }

    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Falling back to local JSON-file Database (Mock Mode)...');
    isMock = true;
    process.env.USE_MOCK_DB = 'true';
    initializeMockDB();
  }
};

const mockDataPath = path.join(__dirname, '../data/db.json');

const initializeMockDB = () => {
  const dir = path.dirname(mockDataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(mockDataPath)) {
    fs.writeFileSync(mockDataPath, JSON.stringify({
      users: [],
      leaves: [],
      salaries: [],
      attendance: [],
      reviews: []
    }, null, 2));
  }
};

module.exports = { connectDB, getIsMock: () => isMock };
