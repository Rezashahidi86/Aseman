import mongoose from 'mongoose';
import env from '../config/env.js';

const migrateProductNameIndex = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const collection = mongoose.connection.collection('products');
    const duplicates = await collection.aggregate(
      [
        {
          $group: {
            _id: {
              branch: '$branch',
              normalizedName: { $toLower: { $trim: { input: '$name' } } },
            },
            names: { $addToSet: '$name' },
            productIds: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ],
    ).toArray();

    if (duplicates.length > 0) {
      console.error(
        'Cannot create the unique product-name index. Resolve these duplicate names within each branch first:',
      );
      for (const duplicate of duplicates) {
        console.error({
          branch: duplicate._id.branch,
          names: duplicate.names,
          productIds: duplicate.productIds,
        });
      }
      throw new Error('Duplicate product names exist within one or more branches');
    }

    const indexes = await collection.indexes();
    const nameIndexes = indexes.filter(
      (index) =>
        index.key.branch === 1 &&
        index.key.name === 1 &&
        Object.keys(index.key).length === 2,
    );

    const correctIndex = nameIndexes.find(
      (index) =>
        index.unique === true &&
        index.collation?.locale === 'en' &&
        index.collation?.strength === 2,
    );

    if (correctIndex) {
      for (const index of nameIndexes) {
        if (index.name !== correctIndex.name) {
          await collection.dropIndex(index.name);
          console.log(`Dropped redundant product-name index: ${index.name}`);
        }
      }
      console.log('Product name index is already correct.');
      return;
    }

    for (const index of nameIndexes) {
      await collection.dropIndex(index.name);
      console.log(`Dropped outdated product-name index: ${index.name}`);
    }

    await collection.createIndex(
      { branch: 1, name: 1 },
      {
        unique: true,
        name: 'unique_product_name_per_branch',
        collation: { locale: 'en', strength: 2 },
      },
    );

    console.log('Created case-insensitive unique product-name index.');
  } catch (error) {
    console.error('Failed to migrate product-name index:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await migrateProductNameIndex();
