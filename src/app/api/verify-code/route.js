// src/app/api/verify-code/route.js

import dbConnect from '@/lib/dbConnect.js';
import SecretCode from '@/models/SecretCode.js';
import { recordVisit } from '@/lib/pageVisitorHelper.js';

export async function POST(request) {
  try {
    await dbConnect();
    const { code } = await request.json();

    const now = new Date();
    console.log('[verify-code] code:', code, '| now:', now.toISOString());

    const found = await SecretCode.findOne({ code: String(code) }).lean();
    console.log('[verify-code] found:', found);

    if (!found) {
      console.log('[verify-code] no code found in db');
      return Response.json({ valid: false });
    }

    const expiresAt = new Date(found.expiresAt);
    console.log('[verify-code] expiresAt:', expiresAt.toISOString(), '| expired:', expiresAt < now);

    if (expiresAt < now) {
      console.log('[verify-code] code expired');
      return Response.json({ valid: false });
    }

    await recordVisit('/dashboard', true);
    return Response.json({ valid: true });
  } catch (err) {
    console.error('[verify-code]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}