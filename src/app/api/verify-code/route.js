// src/app/api/verify-code/route.js

import dbConnect from "@/lib/dbConnect.js";
import SecretCode from "@/models/SecretCode.js";
import { recordVisit } from "@/lib/pageVisitorHelper.js";

export async function POST(request) {
  try {
    await dbConnect();
    const { code } = await request.json();

    const found = await SecretCode.findOne({
      code: String(code),
      expiresAt: { $gt: new Date() },
    });

    if (!found) {
      console.log("[verify-code] invalid or expired code");
      return Response.json({ valid: false });
    }

    await SecretCode.deleteOne({ _id: found._id });

    await recordVisit("/dashboard", true);

    return Response.json({ valid: true });
  } catch (err) {
    console.error("[verify-code] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
