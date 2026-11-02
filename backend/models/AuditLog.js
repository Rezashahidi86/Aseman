import mongoose from 'mongoose';
import ROLES from '../constants/roles.js';

export const AUDIT_ACTIONS = Object.freeze(['CREATE', 'UPDATE', 'DELETE']);
export const AUDIT_RESOURCES = Object.freeze([
  'PRODUCT',
  'SALE',
  'CUSTOMER',
  'USER',
  'BRANCH',
  'REFERENCE_CATALOG',
  'MANUAL_DOCUMENT',
  'NEED',
]);

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    actorRole: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      immutable: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      immutable: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
      immutable: true,
    },
    resource: {
      type: String,
      enum: AUDIT_RESOURCES,
      required: true,
      immutable: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      immutable: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      immutable: true,
    },
    request: {
      requestId: { type: String, maxlength: 100, immutable: true },
      method: { type: String, maxlength: 10, immutable: true },
      path: { type: String, maxlength: 500, immutable: true },
      ip: { type: String, maxlength: 100, immutable: true },
      userAgent: { type: String, maxlength: 500, immutable: true },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    strict: true,
  },
);

auditLogSchema.index({ createdAt: -1, _id: -1 });
auditLogSchema.index({ branch: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
