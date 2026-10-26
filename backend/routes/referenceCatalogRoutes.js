import { Router } from 'express';
import {
  createReferenceCatalog,
  getReferenceCatalog,
  updateReferenceCatalog,
  deleteReferenceCatalog,
} from '../controllers/referenceCatalogController.js';
import {
  createReferenceCatalogSchema,
  updateReferenceCatalogSchema,
} from '../validators/referenceCatalogValidators.js';
import validateMiddleware from '../middlewares/validateMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .get(getReferenceCatalog)
  .post(
    validateMiddleware(createReferenceCatalogSchema, 'body'),
    createReferenceCatalog,
  );
router
  .route('/:id')
  .patch(
    validateMiddleware(updateReferenceCatalogSchema, 'body'),
    updateReferenceCatalog,
  )
  .delete(deleteReferenceCatalog);

export default router;
