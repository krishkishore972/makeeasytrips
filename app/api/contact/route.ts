import { NextResponse } from "next/server";
import { ContactMessageModel } from "@/lib/models/contact-message";
import dbConnect from "@/lib/mongodb";
import { contactSubmissionSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON request body." }, { status: 400 });
  }

  const parsed = contactSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the contact details and try again.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    const saved = await ContactMessageModel.create(parsed.data);

    return NextResponse.json({ data: { id: String(saved._id) } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save contact message", error);

    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 500 },
    );
  }
}
