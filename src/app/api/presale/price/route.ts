import { NextRequest, NextResponse } from 'next/server';
import { getPresalePrice, getCurrentDay, getConfig } from '@/lib/airdrop';
import { PRESALE } from '@/lib/constants';

export async function GET() {
  const day = await getCurrentDay();
  const price = await getPresalePrice();
  const config = await getConfig();
  const sold = Number(config['cxl_sold'] || '0');
  const total = Number(config['cxl_total_supply'] || '1100000');

  return NextResponse.json({
    price,
    day,
    minCXL: PRESALE.minCXL,
    maxCXL: PRESALE.maxCXL,
    sold,
    remaining: total - sold,
    total,
  });
}
