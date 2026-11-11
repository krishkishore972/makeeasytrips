import {
  AuditLogModel,
  type AuditAction,
  type AuditMetadata,
  type AuditOutcome,
} from "@/lib/models/audit-log";
import dbConnect from "@/lib/mongodb";

export type AuditEventInput = {
  action: AuditAction;
  outcome: AuditOutcome;
  actor: string;
  ip: string;
  userAgent?: string;
  target?: string;
  message?: string;
  metadata?: AuditMetadata;
};

function truncate(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/**
 * Audit writes are best-effort: losing the log entry must not turn a successful
 * upload into a failed request or expose database details to the admin.
 */
export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    await dbConnect();
    await AuditLogModel.create({
      ...input,
      actor: input.actor.trim().slice(0, 254),
      ip: input.ip.trim().slice(0, 64),
      userAgent: truncate(input.userAgent, 300),
      target: truncate(input.target, 300),
      message: truncate(input.message, 500),
    });
  } catch (error) {
    console.error("Failed to write admin audit event", error);
  }
}

export function requestAuditContext(headers: Headers): { ip: string; userAgent?: string } {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
  const userAgent = headers.get("user-agent")?.trim();

  return {
    ip,
    userAgent: userAgent ? userAgent.slice(0, 300) : undefined,
  };
}
