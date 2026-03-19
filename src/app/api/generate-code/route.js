import dbConnect from "@/lib/dbConnect.js";
import SecretCode from "@/models/SecretCode.js";

export async function POST(request) {
  try {
    await dbConnect();
    const { code, userId } = await request.json();

    // Delete any existing code for this user
    await SecretCode.deleteMany({ userId });

    // Store new code, expires in 10 minutes
    await SecretCode.create({
      code,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[generate-code]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
