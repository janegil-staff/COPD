// app/api/track-visit/route.js

import { cookies } from 'next/headers';
import { recordVisit } from '@/lib/pageVisitorHelper.js';
import dbConnect from '@/lib/dbConnect.js';

export async function POST(req) {
  try {
    await dbConnect();

    const { page } = await req.json();
    if (!page) {
      return Response.json({ error: 'Missing page' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookieName = `visited_${page.replace(/\//g, '_')}`;
    const hasVisited = cookieStore.has(cookieName);

    // Always record the visit — only isUnique changes
    await recordVisit(page, !hasVisited);

    const response = Response.json({ success: true });

    if (!hasVisited) {
      response.headers.set(
        'Set-Cookie',
        `${cookieName}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax`
      );
    }

    return response;
  } catch (err) {
    console.error('[track-visit]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}