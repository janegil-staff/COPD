// src/app/api/generate-code/route.js

import dbConnect from '@/lib/dbConnect.js';
import SecretCode from '@/models/SecretCode.js';

export async function GET() {
  try {
    await dbConnect();
    const codes = await SecretCode.find({}).lean();
    return Response.json({ codes });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { code, userId } = await request.json();

    await SecretCode.deleteMany({ userId });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await SecretCode.create({
      code: String(code),
      userId,
      expiresAt,
    });

    // Return expiresAt so the client countdown matches exactly
    return Response.json({ success: true, expiresAt });
  } catch (err) {
    console.error('[generate-code POST]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}