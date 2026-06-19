// Centralized Models Export
// Automatically and dynamically routes model queries to Mock Database or Mongoose
// depending on whether MongoDB connected successfully or process.env.USE_MOCK_DB is set.

const getActiveModel = (modelName) => {
  if (process.env.USE_MOCK_DB === 'true') {
    const { MockUser, MockLeave, MockSalary, MockAttendance, MockReview } = require('./mockDb');
    const mockMap = {
      User: MockUser,
      Leave: MockLeave,
      Salary: MockSalary,
      Attendance: MockAttendance,
      Review: MockReview
    };
    return mockMap[modelName];
  } else {
    const mongooseMap = {
      User: require('./User'),
      Leave: require('./Leave'),
      Salary: require('./Salary'),
      Attendance: require('./Attendance'),
      Review: require('./Review')
    };
    return mongooseMap[modelName];
  }
};

const createDynamicModelProxy = (modelName) => {
  return new Proxy({}, {
    get(target, prop) {
      const activeModel = getActiveModel(modelName);
      const val = activeModel[prop];
      if (typeof val === 'function') {
        return val.bind(activeModel);
      }
      return val;
    },
    set(target, prop, value) {
      const activeModel = getActiveModel(modelName);
      activeModel[prop] = value;
      return true;
    }
  });
};

module.exports = {
  User: createDynamicModelProxy('User'),
  Leave: createDynamicModelProxy('Leave'),
  Salary: createDynamicModelProxy('Salary'),
  Attendance: createDynamicModelProxy('Attendance'),
  Review: createDynamicModelProxy('Review')
};

