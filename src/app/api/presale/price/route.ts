import { NextResponse } from 'next/server';
import { getPresalePrice, getCurrentDay, getConfig } from '@/lib/airdrop';
import { PRESALE, PRESALE_SUPPLY_LIMIT } from '@/lib/constants';

export async function GET() {
  const day = await getCurrentDay();
  const price = await getPresalePrice();
  const config = await getConfig();
  const sold = Number(config['cxl_sold'] || '0');

  return NextResponse.json({
    price,
    day,
    minUSDT: PRESALE.minUSDT,
    maxUSDT: PRESALE.maxUSDT,
    sold,
    remaining: PRESALE_SUPPLY_LIMIT - sold,
    presaleSupplyLimit: PRESALE_SUPPLY_LIMIT,
  });
}
