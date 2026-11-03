import { z } from 'zod';
import AuditLog, {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
} from '../models/AuditLog.js';

const auditLogQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    action: z
      .string()
      .refine((value) => AUDIT_ACTIONS.includes(value))
      .optional(),
    resource: z
      .string()
      .refine((value) => AUDIT_RESOURCES.includes(value))
      .optional(),
    actor: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    branch: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    resourceId: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    from: z
      .string()
      .refine((value) => !Number.isNaN(new Date(value).getTime()))
      .optional(),
    to: z
      .string()
      .refine((value) => !Number.isNaN(new Date(value).getTime()))
      .optional(),
  })
  .strict()
  .refine(
    ({ from, to }) =>
      !from || !to || new Date(from).getTime() <= new Date(to).getTime(),
    {
      message: 'From date must be before or equal to to date',
      path: ['to'],
    },
  );

const getAuditLogs = async (req, res, next) => {
  try {
    const validation = auditLogQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return next(validation.error);
    }

    const {
      page,
      limit,
      action,
      resource,
      actor,
      branch,
      resourceId,
      from,
      to,
    } = validation.data;

    const filter = {};

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (actor) filter.actor = actor;
    if (branch) filter.branch = branch;
    if (resourceId) filter.resourceId = resourceId;

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name role')
        .populate('branch', 'name code')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: logs.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: { logs },
    });
  } catch (error) {
    return next(error);
  }
};

export { getAuditLogs };
