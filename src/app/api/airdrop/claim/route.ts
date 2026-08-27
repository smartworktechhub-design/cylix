import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Daily claim has been removed. Only signup bonus is available.' }, { status: 404 });
}
