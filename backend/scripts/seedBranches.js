import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../models/Branch.js';

dotenv.config();

const branches = [
  { name: 'شعبه اول', code: 'BR001' },
  { name: 'شعبه دوم', code: 'BR002' },
  { name: 'شعبه سوم', code: 'BR003' },
];

const seedBranches = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    await Promise.all(
      branches.map(({ name, code }) =>
        Branch.updateOne(
          { code },
          { $setOnInsert: { name, code } },
          { upsert: true },
        ),
      ),
    );

    console.log('Branches seeded successfully');
  } catch (error) {
    console.error('Failed to seed branches:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedBranches();
