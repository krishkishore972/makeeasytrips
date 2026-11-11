import { NextResponse } from "next/server";
import { NewsletterSubscriberModel } from "@/lib/models/newsletter-subscriber";
import dbConnect from "@/lib/mongodb";
import { newsletterSubmissionSchema } from "@/lib/validation/forms";

function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON request body." }, { status: 400 });
  }

  const parsed = newsletterSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Enter a valid email address.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  try {
    await dbConnect();
    await NewsletterSubscriberModel.updateOne(
      { email },
      { $setOnInsert: { email, source: "footer" } },
      { upsert: true },
    );

    return NextResponse.json({ data: { email, subscribed: true } });
  } catch (error) {
    // A concurrent request may have inserted the same unique email first.
    if (isDuplicateKey(error)) {
      return NextResponse.json({ data: { email, subscribed: true } });
    }

    console.error("Failed to save newsletter subscriber", error);

    return NextResponse.json(
      { error: "We couldn't save your email. Please try again." },
      { status: 500 },
    );
  }
}
