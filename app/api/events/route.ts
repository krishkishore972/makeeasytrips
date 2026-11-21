import { NextResponse } from "next/server";
import { getEvents } from "@/lib/data/events";

export async function GET() {
  return NextResponse.json({ data: await getEvents() });
}
