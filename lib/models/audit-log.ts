import { Schema, model, models, type Model } from "mongoose";

export const auditActionValues = [
  "upload.created",
  "upload.rejected",
  "upload.failed",
  "catalogue.created",
  "catalogue.updated",
  "catalogue.deleted",
  "catalogue.rejected",
  "enquiry.status_updated",
] as const;
export type AuditAction = (typeof auditActionValues)[number];

export const auditOutcomeValues = ["success", "rejected", "failed"] as const;
export type AuditOutcome = (typeof auditOutcomeValues)[number];

export type AuditMetadata = {
  folder?: string;
  url?: string;
  publicId?: string;
  format?: string;
  mimeType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  resource?: string;
  recordId?: string;
  title?: string;
  sortOrder?: number;
  reason?: string;
};

export type AuditLogRecord = {
  action: AuditAction;
  outcome: AuditOutcome;
  actor: string;
  ip: string;
  userAgent?: string;
  target?: string;
  message?: string;
  metadata?: AuditMetadata;
};

/**
 * Append-only record of privileged operations. Phase 3 writes upload events;
 * the catalogue editors added later can use the same model without a migration.
 */
const auditLogSchema = new Schema<AuditLogRecord>(
  {
    action: { type: String, required: true, enum: auditActionValues },
    outcome: { type: String, required: true, enum: auditOutcomeValues },
    actor: { type: String, required: true, trim: true, maxlength: 254 },
    ip: { type: String, required: true, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 300 },
    target: { type: String, trim: true, maxlength: 300 },
    message: { type: String, trim: true, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    collection: "audit_logs",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLogModel: Model<AuditLogRecord> =
  (models.AuditLog as Model<AuditLogRecord> | undefined) ??
  model<AuditLogRecord>("AuditLog", auditLogSchema);
