import AppSettings from '../models/AppSettings.js';
import AppError from '../utils/AppError.js';

const getSettings = async (req, res, next) => {
  try {
    let settings = await AppSettings.findOne().select('lowStockThreshold updatedAt');
    if (!settings) settings = await AppSettings.create({ lowStockThreshold: 10 });
    return res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { lowStockThreshold } = req.body;
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 100000) {
      return next(new AppError('lowStockThreshold must be an integer between 0 and 100000', 400));
    }
    const settings = await AppSettings.findOneAndUpdate(
      {},
      { $set: { lowStockThreshold } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select('lowStockThreshold updatedAt');
    return res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    return next(error);
  }
};

export { getSettings, updateSettings };
