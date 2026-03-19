import { getAllPagesStats } from '@/lib/pageVisitorHelper.js';
import dbConnect from '@/lib/dbConnect.js';

export async function GET() {
  try {
    await dbConnect();
    const stats = await getAllPagesStats();
    return Response.json({ success: true, stats });
  } catch (err) {
    console.error('[visitor-stats]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}