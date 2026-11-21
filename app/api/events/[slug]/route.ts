import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/data/events";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const event = await getEventBySlug((await params).slug);
  return event
    ? NextResponse.json({ data: event })
    : NextResponse.json({ error: "Event not found." }, { status: 404 });
}
