const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection function
const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.log('--- [DATABASE] No MONGODB_URI specified. Initializing MongoMemoryServer fallback... ---');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        dbUri = mongoServer.getUri();
        console.log(`--- [DATABASE] In-memory MongoDB running at: ${dbUri} ---`);
      } catch (err) {
        console.error('--- [DATABASE] Failed to initialize MongoMemoryServer:', err.message);
        console.log('--- [DATABASE] Falling back to standard local MongoDB port... ---');
        dbUri = 'mongodb://127.0.0.1:27017/scrap_metal_db';
      }
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`--- [DATABASE] Connected to Mongoose Host: ${conn.connection.host} ---`);

    // Run sample database seeding
    await seedDatabase();
  } catch (error) {
    console.error(`--- [DATABASE] Connection Failure: ${error.message} ---`);
    process.exit(1);
  }
};

// Seeding standard datasets for demonstration purposes

const seedDatabase = async () => {
  const User = mongoose.model('User', require('../models/User').schema);
  const ScrapRecord = mongoose.model('ScrapRecord', require('../models/ScrapRecord').schema);
  const Inventory = mongoose.model('Inventory', require('../models/Inventory').schema);
  const Sale = mongoose.model('Sale', require('../models/Sale').schema);

  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    let seededUsers = [];
    if (userCount === 0) {
      console.log('--- [SEEDING] database is empty. Injecting users... ---');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);

      seededUsers = await User.create([
        {
          name: 'Chief Administrator',
          email: 'admin@scrap.com',
          password: hashedPassword,
          role: 'Admin'
        },
        {
          name: 'Operations Manager',
          email: 'manager@scrap.com',
          password: hashedPassword,
          role: 'Manager'
        },
        {
          name: 'Sorting Operator',
          email: 'worker@scrap.com',
          password: hashedPassword,
          role: 'Worker'
        }
      ]);
      console.log(`--- [SEEDING] Created 3 system users (Credentials: admin@scrap.com / Password123) ---`);
    } else {
      seededUsers = await User.find();
    }

    // Resolve an editor id
    const adminUser = seededUsers.find(u => u.role === 'Admin') || seededUsers[0];
    const workerUser = seededUsers.find(u => u.role === 'Worker') || seededUsers[0];

    // 2. Seed Inventory if empty
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
      console.log('--- [SEEDING] Injecting metal inventory baselines... ---');
      await Inventory.create([
        { metalType: 'Copper', quantity: 2450.5, updatedAt: new Date(Date.now() - 3600000) },
        { metalType: 'Steel', quantity: 18400.0, updatedAt: new Date(Date.now() - 7200000) },
        { metalType: 'Aluminium', quantity: 6200.0, updatedAt: new Date(Date.now() - 10800000) },
        { metalType: 'Brass', quantity: 1120.0, updatedAt: new Date() }
      ]);
      console.log('--- [SEEDING] Inventory levels initialized ---');
    }

    // 3. Seed ScrapRecords if empty
    const scrapCount = await ScrapRecord.countDocuments();
    if (scrapCount === 0) {
      console.log('--- [SEEDING] Injecting scrap records... ---');
      await ScrapRecord.create([
        {
          metalType: 'Copper',
          predictedType: 'Copper',
          weight: 420.5,
          supplier: 'Omega Electronics Corp',
          location: 'Bay 1',
          status: 'Refined',
          image: '/uploads/sample_copper.jpg',
          createdBy: workerUser._id,
          createdAt: new Date(Date.now() - 5 * 24 * 3600000)
        },
        {
          metalType: 'Steel',
          predictedType: 'Steel',
          weight: 5200,
          supplier: 'Metro Demolitions Ltd',
          location: 'Bay 4',
          status: 'Processing',
          image: '/uploads/sample_steel.jpg',
          createdBy: workerUser._id,
          createdAt: new Date(Date.now() - 3 * 24 * 3600000)
        },
        {
          metalType: 'Aluminium',
          predictedType: 'Aluminium',
          weight: 1250,
          supplier: 'Apex Auto Parts',
          location: 'Bay 2',
          status: 'Collected',
          image: '/uploads/sample_aluminium.jpg',
          createdBy: workerUser._id,
          createdAt: new Date(Date.now() - 1 * 24 * 3600000)
        },
        {
          metalType: 'Brass',
          predictedType: 'Brass',
          weight: 350.2,
          supplier: 'Coastal Plumbing Supply',
          location: 'Bay 3',
          status: 'Sold',
          image: '/uploads/sample_brass.jpg',
          createdBy: workerUser._id,
          createdAt: new Date(Date.now() - 8 * 24 * 3600000)
        },
        {
          metalType: 'Copper',
          predictedType: 'Copper',
          weight: 180.8,
          supplier: 'Local Construction Site B',
          location: 'Bay 1',
          status: 'Collected',
          image: '/uploads/sample_copper2.jpg',
          createdBy: workerUser._id,
          createdAt: new Date()
        }
      ]);
      console.log('--- [SEEDING] Scrap records injected ---');
    }

    // 4. Seed Sales if empty
    const salesCount = await Sale.countDocuments();
    if (salesCount === 0) {
      console.log('--- [SEEDING] Injecting sales ledger history... ---');
      await Sale.create([
        {
          buyerName: 'Global Smelting Inc',
          metalType: 'Copper',
          quantity: 1200,
          price: 9600, // $8/kg
          soldBy: adminUser._id,
          createdAt: new Date(Date.now() - 12 * 24 * 3600000)
        },
        {
          buyerName: 'United Iron & Steel Group',
          metalType: 'Steel',
          quantity: 10000,
          price: 3500, // $0.35/kg
          soldBy: adminUser._id,
          createdAt: new Date(Date.now() - 8 * 24 * 3600000)
        },
        {
          buyerName: 'AluRecycle Corp',
          metalType: 'Aluminium',
          quantity: 3500,
          price: 7700, // $2.20/kg
          soldBy: adminUser._id,
          createdAt: new Date(Date.now() - 4 * 24 * 3600000)
        },
        {
          buyerName: 'Apex Foundry Ltd',
          metalType: 'Brass',
          quantity: 800,
          price: 3840, // $4.80/kg
          soldBy: adminUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 3600000)
        }
      ]);
      console.log('--- [SEEDING] Sales history injected. All seeding completed successfully! ---');
    }

  } catch (err) {
    console.error('--- [SEEDING] Failed to seed records:', err.message);
  }
};

module.exports = connectDB;
