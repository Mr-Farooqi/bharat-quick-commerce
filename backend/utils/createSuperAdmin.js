require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const createSuperAdmin = async () => {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const name = args[2] || 'Platform Administrator';
  const phone = args[3] || '9876543210';

  if (!email || !password) {
    console.log('Usage: node utils/createSuperAdmin.js <email> <password> [name] [phone]');
    console.log('Example: node utils/createSuperAdmin.js myadmin@bharatbasket.com MySecretPassword123 "Adil Admin" 9876543210');
    process.exit(1);
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.password = password; // Will be hashed by UserSchema pre-save hook
      await existing.save();
      console.log(`✅ Existing account '${email}' has been successfully upgraded to Super Admin!`);
    } else {
      await User.create({
        name,
        email,
        password,
        phone,
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Real production Super Admin created successfully for '${email}'!`);
    }

    console.log('You can now log in securely at your Admin Console.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
