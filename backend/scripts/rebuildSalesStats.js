import mongoose from 'mongoose';
import env from '../config/env.js';
import Sale from '../models/Sale.js';
import SalesStats from '../models/SalesStats.js';

const jalaliMonthFormatter = new Intl.DateTimeFormat(
  'en-US-u-ca-persian-nu-latn',
  {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
  },
);

const getJalaliMonthKey = (date) => {
  const parts = Object.fromEntries(
    jalaliMonthFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month.padStart(2, '0')}`;
};

const aggregateStats = async (format, periodType) =>
  Sale.aggregate([
    {
      $group: {
        _id: {
          branch: '$branch',
          periodKey: {
            $dateToString: {
              format,
              date: '$createdAt',
              timezone: 'Asia/Tehran',
            },
          },
        },
        totalSales: { $sum: '$totalSales' },
        totalProfit: { $sum: '$totalProfit' },
        totalItemsSold: { $sum: '$totalItemsSold' },
        salesCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        branch: '$_id.branch',
        periodType: { $literal: periodType },
        periodKey: '$_id.periodKey',
        totalSales: 1,
        totalProfit: 1,
        totalItemsSold: 1,
        salesCount: 1,
      },
    },
  ]);

const rebuildSalesStats = async () => {
  await mongoose.connect(env.DATABASE_URL);

  try {
    const salesCount = await Sale.countDocuments();

    if (salesCount === 0) {
      throw new Error(
        'No sales were found. Refusing to rebuild and potentially clear sales statistics.',
      );
    }

    const [dailyStats, sales] = await Promise.all([
      aggregateStats('%Y-%m-%d', 'daily'),
      Sale.find()
        .select('branch createdAt totalSales totalProfit totalItemsSold')
        .lean(),
    ]);

    const monthlyMap = new Map();

    for (const sale of sales) {
      const periodKey = getJalaliMonthKey(sale.createdAt);
      const key = `${sale.branch.toString()}:${periodKey}`;
      const current = monthlyMap.get(key) || {
        branch: sale.branch,
        periodType: 'monthly',
        periodKey,
        totalSales: 0,
        totalProfit: 0,
        totalItemsSold: 0,
        salesCount: 0,
      };

      current.totalSales += sale.totalSales;
      current.totalProfit += sale.totalProfit;
      current.totalItemsSold += sale.totalItemsSold;
      current.salesCount += 1;
      monthlyMap.set(key, current);
    }

    const monthlyStats = [...monthlyMap.values()];

    const expectedStats = [...dailyStats, ...monthlyStats];
    const operations = expectedStats.map((stats) => ({
      updateOne: {
        filter: {
          branch: stats.branch,
          periodType: stats.periodType,
          periodKey: stats.periodKey,
        },
        update: {
          $set: {
            totalSales: stats.totalSales,
            totalProfit: stats.totalProfit,
            totalItemsSold: stats.totalItemsSold,
            salesCount: stats.salesCount,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await SalesStats.bulkWrite(operations, { ordered: true });
    }

    const expectedKeys = new Set(
      expectedStats.map(
        ({ branch, periodType, periodKey }) =>
          `${branch.toString()}:${periodType}:${periodKey}`,
      ),
    );

    const existingStats = await SalesStats.find()
      .select('_id branch periodType periodKey')
      .lean();

    const staleIds = existingStats
      .filter(
        ({ branch, periodType, periodKey }) =>
          !expectedKeys.has(`${branch.toString()}:${periodType}:${periodKey}`),
      )
      .map(({ _id }) => _id);

    if (staleIds.length > 0) {
      await SalesStats.deleteMany({ _id: { $in: staleIds } });
    }

    console.info(
      `Sales statistics rebuilt from ${salesCount} sales: ${dailyStats.length} daily and ${monthlyStats.length} monthly records.`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

rebuildSalesStats().catch((error) => {
  console.error('Failed to rebuild sales statistics:', error.message);
  process.exitCode = 1;
});
