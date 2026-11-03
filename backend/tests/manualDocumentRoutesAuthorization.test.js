import { describe, expect, it } from 'vitest';
import manualDocumentsRouter from '../routes/manualDocumentsRoutes.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

describe('Manual document route authorization', () => {
  it('allows authenticated admins and branch-authorized sellers to delete documents', () => {
    const deleteRoute = manualDocumentsRouter.stack.find(
      (layer) => layer.route?.path === '/:id' && layer.route.methods.delete,
    );

    expect(deleteRoute).toBeDefined();
    expect(deleteRoute.route.stack[0].handle).toBe(setBranchContext);
    expect(deleteRoute.route.stack[0].handle).not.toBe(authMiddleware);
    expect(deleteRoute.route.stack[1].handle.name).toBe('deleteManualDocument');
  });

  it('keeps authentication enabled for manual document routes', () => {
    expect(manualDocumentsRouter.stack[0].handle).toBe(authMiddleware);
  });
});
