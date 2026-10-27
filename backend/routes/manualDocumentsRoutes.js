import { Router } from 'express';
import {
  createManualDocument,
  getManualDocuments,
  deleteManualDocument,
} from '../controllers/manualDocumentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import uploadManualDocumentImage from '../middlewares/manualDocumentUpload.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .post(
    setBranchContext,
    uploadManualDocumentImage.array('image', 10),
    createManualDocument,
  )
  .get(setBranchContext, getManualDocuments);

router.delete('/:id', deleteManualDocument);

export default router;
