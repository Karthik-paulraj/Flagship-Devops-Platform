require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { defaultUsers, defaultProducts } = require('./productsData');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
  await mongoose.connect(mongoUri);
  console.log(`[Seed] Connected to MongoDB for seeding at ${mongoUri}`);
};

const autoSeedIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[AutoSeed] MongoDB is empty. Seeding catalog products and demo accounts...');
      for (const u of defaultUsers) {
        await User.create(u);
      }
      // Strip mock _id string to let MongoDB generate ObjectIds or keep standard ObjectIds
      const productsToInsert = defaultProducts.map((p) => {
        const copy = { ...p };
        delete copy._id;
        return copy;
      });
      const inserted = await Product.insertMany(productsToInsert);
      console.log(`[AutoSeed] Inserted ${inserted.length} catalog products.`);
      
      const demoUser = await User.findOne({ role: 'user' });
      if (demoUser && inserted.length >= 2) {
        await Review.create([
          {
            user: demoUser._id,
            name: demoUser.name,
            product: inserted[0]._id,
            rating: 5,
            comment: 'Outstanding build quality and crystal clear audio fidelity! Worth every cent.',
          },
          {
            user: demoUser._id,
            name: demoUser.name,
            product: inserted[1]._id,
            rating: 5,
            comment: 'The mechanical switches feel incredible. Great tactile feedback.',
          },
        ]);
      }
      console.log('[AutoSeed] Database auto-population completed!');
    }
  } catch (err) {
    console.warn(`[AutoSeed Notice] ${err.message}`);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Purging existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('[Seed] Database cleared.');

    console.log('[Seed] Creating demo and admin user accounts...');
    const createdUsers = [];
    for (const u of defaultUsers) {
      const created = await User.create(u);
      createdUsers.push(created);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const demoUser = createdUsers.find((u) => u.role === 'user');
    console.log(`[Seed] Created ${createdUsers.length} users:`);
    console.log(`       - Admin: ${adminUser.email} / Admin@123`);
    console.log(`       - User:  ${demoUser.email} / User@123`);

    console.log(`[Seed] Inserting ${defaultProducts.length} catalog products...`);
    const productsToInsert = defaultProducts.map((p) => {
      const copy = { ...p };
      delete copy._id;
      return copy;
    });
    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Inserted ${createdProducts.length} products.`);

    console.log('[Seed] Seeding sample customer reviews...');
    if (createdProducts.length > 0 && demoUser) {
      await Review.create([
        {
          user: demoUser._id,
          name: demoUser.name,
          product: createdProducts[0]._id,
          rating: 5,
          comment: 'Outstanding build quality and crystal clear audio fidelity! Worth every cent.',
        },
        {
          user: demoUser._id,
          name: demoUser.name,
          product: createdProducts[1]._id,
          rating: 5,
          comment: 'The mechanical switches feel incredible. Great tactile feedback.',
        },
      ]);
    }

    console.log('--------------------------------------------------');
    console.log('✓ Database Seeding Completed Successfully!');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData, autoSeedIfEmpty };
