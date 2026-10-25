import ROLES from "../constants/roles.js";
import AppError from "../utils/AppError.js";

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(
      new AppError("Access denied. Admin role required.", 403),
    );
  }

  next();
};

export default requireAdmin;