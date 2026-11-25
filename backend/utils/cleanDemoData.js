require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

const cleanDemoData = async () => {
  try {
    await connectDB();
    console.log('[CleanProd] Connected to MongoDB Atlas. Preparing to wipe demo/test data...');

    // List of demo emails to clean
    const demoEmails = [
      'admin@bharat.com',
      'admin@bharatbasket.com',
      'seller@bharat.com',
      'seller@bharatbasket.com',
      'newvendor@bharat.com',
      'customer@bharat.com',
      'customer@bharatbasket.com',
      'rider@bharatbasket.com',
    ];

    // Find demo users
    const demoUsers = await User.find({ email: { $in: demoEmails } });
    const demoUserIds = demoUsers.map((u) => u._id);

    console.log(`[CleanProd] Found ${demoUsers.length} demo user accounts.`);

    // 1. Delete test orders created by or assigned to demo users
    const ordersDeleted = await Order.deleteMany({
      $or: [
        { customer: { $in: demoUserIds } },
        { deliveryPartner: { $in: demoUserIds } },
      ],
    });
    console.log(`[CleanProd] Deleted ${ordersDeleted.deletedCount} dummy test orders.`);

    // 2. Delete demo users
    const usersDeleted = await User.deleteMany({ _id: { $in: demoUserIds } });
    console.log(`[CleanProd] Deleted ${usersDeleted.deletedCount} demo user profiles.`);

    console.log('-------------------------------------------------------');
    console.log('✅ DEMO DATA CLEANUP COMPLETE!');
    console.log('Master Categories and Master Products are preserved.');
    console.log('Your database is now clean and ready for real market users.');
    console.log('To create your private Super Admin, run:');
    console.log('  node utils/createSuperAdmin.js <email> <password> <name>');
    console.log('-------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Failed to clean demo data:', error);
    process.exit(1);
  }
};

cleanDemoData();
