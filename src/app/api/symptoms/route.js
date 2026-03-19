import dbConnect from "@/lib/dbConnect.js";
import SymptomDay from "@/models/SymptomDay.js";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "test-user";
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear());
    const month = parseInt(searchParams.get("month") ?? new Date().getMonth());

    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0, 23, 59, 59);

    const days = await SymptomDay.find({
      userId,
      date: { $gte: from, $lte: to },
    }).lean();

    return Response.json({ success: true, days });
  } catch (err) {
    console.error("[symptoms GET]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
