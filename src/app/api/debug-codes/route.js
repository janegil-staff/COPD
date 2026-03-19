// src/app/api/debug-codes/route.js

import dbConnect from '@/lib/dbConnect.js';
import SecretCode from '@/models/SecretCode.js';

export async function GET() {
  try {
    await dbConnect();
    const codes = await SecretCode.find({}).lean();
    return Response.json({ codes });
  } catch (err) {
    console.error('[debug-codes]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}