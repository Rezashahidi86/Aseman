import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import setBranchContext from "../middlewares/branchMiddleware.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .post(setBranchContext, createProduct)
  .get(setBranchContext, getProducts);

router.route("/:id").get(getProductById).patch(updateProduct).delete(deleteProduct);

export default router;