import { NextRequest, NextResponse } from 'next/server';
import { rebuildMatrixTree } from '@/lib/db';
import { validateAdminToken } from '../auth/route';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token || !await validateAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await rebuildMatrixTree();
  return NextResponse.json(result);
}
