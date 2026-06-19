const fs = require('fs');
const path = require('path');
const mockDataPath = path.join(__dirname, '../data/db.json');

const readData = () => {
  try {
    if (!fs.existsSync(mockDataPath)) {
      return { users: [], leaves: [], salaries: [], attendance: [], reviews: [] };
    }
    return JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  } catch (error) {
    return { users: [], leaves: [], salaries: [], attendance: [], reviews: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
};

class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName; // 'users', 'leaves', 'salaries', etc.
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  async find(filter = {}) {
    const data = readData();
    let results = data[this.collectionName] || [];
    
    // Apply filters
    return results.filter(item => {
      for (let key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async findById(id) {
    const data = readData();
    const results = data[this.collectionName] || [];
    return results.find(item => item.id === id || item._id === id) || null;
  }

  async create(itemData) {
    const data = readData();
    const newItem = {
      _id: this.generateId(),
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...itemData
    };
    
    if (!data[this.collectionName]) {
      data[this.collectionName] = [];
    }
    data[this.collectionName].push(newItem);
    writeData(data);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const data = readData();
    const collection = data[this.collectionName] || [];
    const index = collection.findIndex(item => item.id === id || item._id === id);
    
    if (index === -1) return null;
    
    // If updateData has $set or similar, flatten it, or just merge
    let finalUpdate = updateData;
    if (updateData.$set) {
      finalUpdate = { ...updateData.$set };
    }
    
    collection[index] = {
      ...collection[index],
      ...finalUpdate,
      updatedAt: new Date().toISOString()
    };
    
    data[this.collectionName] = collection;
    writeData(data);
    return collection[index];
  }

  async findByIdAndDelete(id) {
    const data = readData();
    const collection = data[this.collectionName] || [];
    const itemToDelete = collection.find(item => item.id === id || item._id === id);
    
    if (!itemToDelete) return null;
    
    data[this.collectionName] = collection.filter(item => item.id !== id && item._id !== id);
    writeData(data);
    return itemToDelete;
  }

  async countDocuments(filter = {}) {
    const results = await this.find(filter);
    return results.length;
  }
}

module.exports = {
  MockUser: new MockModel('users'),
  MockLeave: new MockModel('leaves'),
  MockSalary: new MockModel('salaries'),
  MockAttendance: new MockModel('attendance'),
  MockReview: new MockModel('reviews'),
  readData,
  writeData
};
