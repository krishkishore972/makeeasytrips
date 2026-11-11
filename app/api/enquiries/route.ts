import { NextResponse } from "next/server";
import { EnquiryModel } from "@/lib/models/enquiry";
import dbConnect from "@/lib/mongodb";
import { enquirySubmissionSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON request body." }, { status: 400 });
  }

  const parsed = enquirySubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the enquiry details and try again.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    const saved = await EnquiryModel.create(parsed.data);

    return NextResponse.json({ data: { id: String(saved._id) } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save enquiry", error);

    return NextResponse.json(
      { error: "We couldn't save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
