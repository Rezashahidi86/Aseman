import AuditLog from '../models/AuditLog.js';

const RESOURCE_FIELDS = Object.freeze({
  PRODUCT: [
    'name',
    'barcode',
    'purchasePrice',
    'salePrice',
    'quantity',
    'minimumStock',
    'salesCount',
    'branch',
  ],
  SALE: [
    'branch',
    'createdBy',
    'items',
    'totalSales',
    'totalProfit',
    'totalItemsSold',
  ],
  CUSTOMER: ['branch', 'name'],
  USER: ['name', 'role', 'branch', 'isActive'],
  BRANCH: ['name', 'code', 'isActive'],
  REFERENCE_CATALOG: ['name', 'barcode', 'purchasePrice', 'salePrice'],
  MANUAL_DOCUMENT: ['branch', 'createdBy'],
  NEED: ['branch', 'product', 'productName', 'requestedQuantity', 'status'],
});

const SALE_ITEM_FIELDS = [
  'product',
  'name',
  'barcode',
  'quantity',
  'purchasePrice',
  'finalSalePrice',
  'lineTotal',
  'lineProfit',
];

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value?.toHexString === 'function') {
    return value.toHexString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === 'object') {
    if (typeof value.toObject === 'function') {
      return normalizeValue(value.toObject());
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeValue(item)]),
    );
  }

  return value;
};

const pickSnapshot = (resource, snapshot) => {
  if (!snapshot) {
    return null;
  }

  const plainSnapshot = normalizeValue(snapshot);
  const fields = RESOURCE_FIELDS[resource];

  if (!fields) {
    throw new Error('Unsupported audit resource');
  }

  const result = {};

  for (const field of fields) {
    if (plainSnapshot[field] !== undefined) {
      if (resource === 'SALE' && field === 'items') {
        result.items = (plainSnapshot.items || []).map((item) =>
          Object.fromEntries(
            SALE_ITEM_FIELDS
              .filter((itemField) => item[itemField] !== undefined)
              .map((itemField) => [itemField, item[itemField]]),
          ),
        );
      } else {
        result[field] = plainSnapshot[field];
      }
    }
  }

  return result;
};

const createAuditLog = async ({
  req,
  action,
  resource,
  resourceId = null,
  branchId = null,
  before = null,
  after = null,
  session = null,
}) => {
  if (!req?.user?._id) {
    throw new Error('Authenticated actor is required for audit logging');
  }

  const resolvedBranchId =
    branchId || req.branchId || req.user.branch || null;

  const auditData = {
    actor: req.user._id,
    actorRole: req.user.role,
    branch: resolvedBranchId,
    action,
    resource,
    resourceId,
    changes: {
      before: pickSnapshot(resource, before),
      after: pickSnapshot(resource, after),
    },
    request: {
      requestId: req.get?.('x-request-id') || undefined,
      method: req.method,
      path: req.originalUrl?.slice(0, 500),
      ip: req.ip,
      userAgent: req.get?.('user-agent')?.slice(0, 500),
    },
  };

  const [auditLog] = await AuditLog.create([auditData], session ? { session } : {});

  return auditLog;
};

export { createAuditLog, pickSnapshot };
