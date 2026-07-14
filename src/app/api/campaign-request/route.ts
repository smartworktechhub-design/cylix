import { NextResponse } from 'next/server';
import { submitCampaignRequest } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { campaignId, userId } = await req.json();
    if (!campaignId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing campaignId or userId' }, { status: 400 });
    }

    const result = await submitCampaignRequest(campaignId, userId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Something went wrong' }, { status: 500 });
  }
}
