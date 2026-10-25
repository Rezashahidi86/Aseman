import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ROLES from '../constants/roles.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const { DATABASE_URL, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!DATABASE_URL || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Required environment variables are missing');
    }

    await mongoose.connect(DATABASE_URL);

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.updateOne(
      { email: ADMIN_EMAIL.toLowerCase().trim() },
      {
        $setOnInsert: {
          name: ADMIN_NAME.trim(),
          email: ADMIN_EMAIL.toLowerCase().trim(),
          passwordHash,
          role: ROLES.ADMIN,
          branch: null,
          isActive: true,
        },
      },
      { upsert: true },
    );

    console.log('Admin seed completed successfully');
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedAdmin();
