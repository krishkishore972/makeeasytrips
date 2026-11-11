import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  connect: vi.fn(),
  update: vi.fn(),
  audit: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/admin/session", () => ({ requireAdminSession: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ default: mocks.connect }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/admin/audit", () => ({
  requestAuditContext: () => ({ ip: "test" }),
  recordAuditEvent: mocks.audit,
}));
vi.mock("@/lib/models/enquiry", () => ({
  enquiryStatusValues: ["new", "contacted", "closed"],
  EnquiryModel: { findByIdAndUpdate: mocks.update },
}));
import { updateEnquiryStatusAction } from "@/lib/admin/enquiry-actions";
const form = (status: string) => {
  const value = new FormData();
  value.set("id", "507f1f77bcf86cd799439011");
  value.set("status", status);
  return value;
};
describe("enquiry status action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ email: "admin@example.com" });
    mocks.connect.mockResolvedValue(undefined);
    mocks.update.mockReturnValue({ lean: () => ({ exec: async () => ({ status: "new" }) }) });
  });
  it("updates valid statuses, audits and revalidates", async () => {
    expect(await updateEnquiryStatusAction({}, form("contacted"))).toMatchObject({
      status: "contacted",
    });
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "enquiry.status_updated" }),
    );
    expect(mocks.revalidate).toHaveBeenCalledWith("/admin");
  });
  it("rejects invalid status without writing", async () => {
    expect(await updateEnquiryStatusAction({}, form("deleted"))).toHaveProperty("error");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("requires a session before reading or writing", async () => {
    mocks.auth.mockRejectedValue(new Error("unauthorized"));
    await expect(updateEnquiryStatusAction({}, form("closed"))).rejects.toThrow("unauthorized");
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("does not audit an unchanged status", async () => {
    await updateEnquiryStatusAction({}, form("new"));
    expect(mocks.audit).not.toHaveBeenCalled();
  });
});
