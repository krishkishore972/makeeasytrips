"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { recordAuditEvent, requestAuditContext } from "@/lib/admin/audit";
import { EnquiryModel, enquiryStatusValues } from "@/lib/models/enquiry";
import dbConnect from "@/lib/mongodb";

const inputSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
  status: z.enum(enquiryStatusValues),
});
export type EnquiryActionState = {
  error?: string;
  message?: string;
  status?: (typeof enquiryStatusValues)[number];
};

export async function updateEnquiryStatusAction(
  _state: EnquiryActionState,
  form: FormData,
): Promise<EnquiryActionState> {
  const session = await requireAdminSession();
  const input = inputSchema.safeParse({ id: form.get("id"), status: form.get("status") });
  if (!input.success) return { error: "Choose a valid status and enquiry." };
  const { id, status } = input.data;
  try {
    await dbConnect();
    const previous = await EnquiryModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { runValidators: true, new: false },
    )
      .lean<{ status?: string } | null>()
      .exec();
    if (!previous) return { error: "This enquiry no longer exists." };
    const oldStatus = previous.status ?? "new";
    if (oldStatus !== status) {
      const context = requestAuditContext(await headers());
      await recordAuditEvent({
        action: "enquiry.status_updated",
        outcome: "success",
        actor: session.email,
        ...context,
        target: `enquiries/${id}`,
        message: `Status changed from ${oldStatus} to ${status}.`,
        metadata: { recordId: id },
      });
    }
    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${id}`);
    return { message: "Status updated.", status };
  } catch (error) {
    console.error("Failed to update enquiry status", error);
    return { error: "The status could not be updated. Please try again." };
  }
}
