import { describe, expect, it } from 'vitest';
import usersRouter from '../routes/usersRoutes.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/roleMiddleware.js';

describe('User management route authorization', () => {
  it('requires authentication and admin authorization before user-management routes', () => {
    expect(usersRouter.stack[0].handle).toBe(authMiddleware);
    expect(usersRouter.stack[1].handle).toBe(requireAdmin);

    const firstRouteIndex = usersRouter.stack.findIndex((layer) => layer.route);
    expect(firstRouteIndex).toBeGreaterThanOrEqual(2);
  });
});
