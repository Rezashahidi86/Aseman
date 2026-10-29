import mongoose from 'mongoose';
import env from '../config/env.js';

const migrateProductBarcodeIndex = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const collection = mongoose.connection.collection('products');
    const indexes = await collection.indexes();

    await collection.updateMany(
      { barcode: '' },
      { $unset: { barcode: '' } },
    );

    const barcodeIndex = indexes.find(
      (index) =>
        index.key.branch === 1 &&
        index.key.barcode === 1 &&
        Object.keys(index.key).length === 2,
    );

    const hasCorrectIndex =
      barcodeIndex?.unique === true &&
      barcodeIndex.partialFilterExpression?.barcode?.$type === 'string';

    if (hasCorrectIndex) {
      console.log('Product barcode index is already correct.');
      return;
    }

    if (barcodeIndex) {
      await collection.dropIndex(barcodeIndex.name);
      console.log(`Dropped product barcode index: ${barcodeIndex.name}`);
    }

    await collection.createIndex(
      { branch: 1, barcode: 1 },
      {
        unique: true,
        name: 'unique_barcode_per_branch',
        partialFilterExpression: { barcode: { $type: 'string' } },
      },
    );

    console.log('Created partial unique product barcode index.');
  } catch (error) {
    console.error('Failed to migrate product barcode index:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await migrateProductBarcodeIndex();
