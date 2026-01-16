import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const providerName = searchParams.get('provider') || 'gequbao';

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const provider = getProvider(providerName);
  const items = await provider.search(q);

  return NextResponse.json({ items });
}
