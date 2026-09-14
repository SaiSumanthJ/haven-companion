import { getModelHealth } from "@/ports/model";
import { NextResponse } from "next/server";

export async function GET() {
  const health = await getModelHealth();
  return NextResponse.json(health);
}
