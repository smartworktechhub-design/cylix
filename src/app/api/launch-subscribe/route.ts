import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const sb = getServiceSupabase();

    // Check duplicate
    const { data: existing, error: selErr } = await sb
      .from('launch_emails')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (selErr) {
      return NextResponse.json({ error: 'Table not found. Please create the launch_emails table in Supabase SQL Editor.', detail: selErr.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 });
    }

    const { error: insErr } = await sb
      .from('launch_emails')
      .insert({ email: cleanEmail });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}