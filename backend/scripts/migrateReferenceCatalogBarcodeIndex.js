import mongoose from 'mongoose';
import env from '../config/env.js';

const migrateReferenceCatalogBarcodeIndex = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const collection = mongoose.connection.collection('referencecatalogs');
    const indexes = await collection.indexes();

    const barcodeIndex = indexes.find(
      (index) =>
        index.key.barcode === 1 && Object.keys(index.key).length === 1,
    );

    const hasCorrectIndex =
      barcodeIndex?.unique === true &&
      barcodeIndex.partialFilterExpression?.barcode?.$type === 'string';

    if (hasCorrectIndex) {
      console.log('Reference catalog barcode index is already correct.');
      return;
    }

    if (barcodeIndex) {
      await collection.dropIndex(barcodeIndex.name);
      console.log(`Dropped reference catalog barcode index: ${barcodeIndex.name}`);
    }

    await collection.createIndex(
      { barcode: 1 },
      {
        unique: true,
        partialFilterExpression: { barcode: { $type: 'string' } },
      },
    );

    console.log('Created partial unique reference catalog barcode index.');
  } catch (error) {
    console.error('Failed to migrate reference catalog barcode index:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await migrateReferenceCatalogBarcodeIndex();
