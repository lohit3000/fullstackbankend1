require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/dbConnect');
const { User, Leave, Salary, Attendance, Review } = require('./models');

const seedDB = async (shouldExit = true) => {
  // First make sure we connect to the database (Mongoose or initialize Mock)
  await connectDB();

  console.log('🌱 Checking / Seeding database...');

  try {
    // Check if we already have users
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️ Database already seeded. Skipping.');
      if (shouldExit) process.exit(0);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'admin',
      department: 'IT / Operations',
      designation: 'System Administrator',
      salary: 120000,
      status: 'active'
    });
    console.log(`✅ Admin user seeded: ${admin.email}`);

    // Create HR Manager
    const hr = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@company.com',
      password: hashedPassword,
      role: 'hr',
      department: 'Human Resources',
      designation: 'HR Lead',
      salary: 80000,
      status: 'active'
    });
    console.log(`✅ HR user seeded: ${hr.email}`);

    // Create Employee
    const employee = await User.create({
      name: 'Alex Rivera',
      email: 'employee@company.com',
      password: hashedPassword,
      role: 'employee',
      department: 'Engineering',
      designation: 'Fullstack Engineer',
      salary: 95000,
      status: 'active'
    });
    console.log(`✅ Employee user seeded: ${employee.email}`);

    // Create another employee for demonstration
    const employee2 = await User.create({
      name: 'Liam Chen',
      email: 'liam@company.com',
      password: hashedPassword,
      role: 'employee',
      department: 'Marketing',
      designation: 'Marketing Specialist',
      salary: 65000,
      status: 'active'
    });
    console.log(`✅ Employee user 2 seeded: ${employee2.email}`);

    // Seed some initial leave requests
    await Leave.create({
      employee: employee._id,
      employeeName: employee.name,
      type: 'sick',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Recovering from flu',
      status: 'approved',
      approvedBy: hr.name
    });

    await Leave.create({
      employee: employee2._id,
      employeeName: employee2.name,
      type: 'casual',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Family event',
      status: 'pending'
    });

    // Seed some initial attendance logs
    await Attendance.create({
      employee: employee._id,
      employeeName: employee.name,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkIn: '09:05:12',
      checkOut: '18:10:45',
      status: 'present'
    });

    await Attendance.create({
      employee: employee2._id,
      employeeName: employee2.name,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkIn: '08:58:32',
      checkOut: '17:02:15',
      status: 'present'
    });

    // Seed some salary slips
    await Salary.create({
      employee: employee._id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      month: 'May',
      year: 2026,
      basicSalary: employee.salary,
      allowances: 1500,
      deductions: 500,
      netSalary: employee.salary + 1500 - 500,
      status: 'paid'
    });

    // Seed a performance review
    await Review.create({
      employee: employee._id,
      employeeName: employee.name,
      reviewerName: hr.name,
      rating: 5,
      feedback: 'Alex has shown excellent initiative in improving the codebase performance. Keep it up!',
      reviewPeriod: 'Q1 2026'
    });

    console.log('🎉 Database seeding completed successfully.');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    if (shouldExit) process.exit(1);
    else throw error;
  }
};

if (require.main === module) {
  seedDB(true);
}

module.exports = { seedDB };

