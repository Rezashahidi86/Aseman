import { describe, expect, it } from 'vitest';
import manualDocumentsRouter from '../routes/manualDocumentsRoutes.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

describe('Manual document route authorization', () => {
  it('requires an admin before deleting a manual document', () => {
    const deleteRoute = manualDocumentsRouter.stack.find(
      (layer) =>
        layer.route?.path === '/:id' && layer.route.methods.delete,
    );

    expect(deleteRoute).toBeDefined();
    expect(deleteRoute.route.stack[0].handle).toBe(requireAdmin);
  });
});
