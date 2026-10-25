import mongoose from 'mongoose';
import env from '../config/env.js';

const migrateProductNameIndex = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const collection = mongoose.connection.collection('products');
    const indexes = await collection.indexes();
    const uniqueNameIndex = indexes.find((index) =>
      index.unique === true &&
      index.key.branch === 1 &&
      index.key.name === 1 &&
      Object.keys(index.key).length === 2,
    );

    if (uniqueNameIndex) {
      await collection.dropIndex(uniqueNameIndex.name);
      console.log(`Dropped unique product-name index: ${uniqueNameIndex.name}`);
    }

    const hasNameIndex = indexes.some((index) =>
      index.key.branch === 1 &&
      index.key.name === 1 &&
      Object.keys(index.key).length === 2 &&
      index.name !== uniqueNameIndex?.name,
    );

    if (!hasNameIndex) {
      await collection.createIndex({ branch: 1, name: 1 });
      console.log('Created non-unique product-name index.');
    }
  } catch (error) {
    console.error('Failed to migrate product-name index:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await migrateProductNameIndex();