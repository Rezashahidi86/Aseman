import mongoose from 'mongoose';
import env from '../config/env.js';

const migrateProductBarcodeIndex = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const collection = mongoose.connection.collection('products');

    await collection.updateMany(
      { barcode: { $in: ['', null] } },
      { $unset: { barcode: '' } },
    );

    let indexes = await collection.indexes();

    const barcodeIndexes = indexes.filter(
      (index) => index.unique === true && index.key.barcode === 1,
    );

    const correctIndex = barcodeIndexes.find(
      (index) =>
        index.key.branch === 1 &&
        Object.keys(index.key).length === 2 &&
        index.partialFilterExpression?.barcode?.$type === 'string',
    );

    for (const index of barcodeIndexes) {
      if (correctIndex && index.name === correctIndex.name) {
        continue;
      }

      await collection.dropIndex(index.name);
      console.log(`Dropped outdated unique barcode index: ${index.name}`);
    }

    indexes = await collection.indexes();

    const hasCorrectIndex = indexes.some(
      (index) =>
        index.key.branch === 1 &&
        index.key.barcode === 1 &&
        Object.keys(index.key).length === 2 &&
        index.unique === true &&
        index.partialFilterExpression?.barcode?.$type === 'string',
    );

    if (!hasCorrectIndex) {
      await collection.createIndex(
        { branch: 1, barcode: 1 },
        {
          unique: true,
          name: 'unique_barcode_per_branch',
          partialFilterExpression: { barcode: { $type: 'string' } },
        },
      );

      console.log('Created partial unique product barcode index.');
    } else {
      console.log('Product barcode index is already correct.');
    }
  } catch (error) {
    console.error('Failed to migrate product barcode index:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await migrateProductBarcodeIndex();
