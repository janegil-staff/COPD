// lib/pageVisitorHelper.js

import PageVisitor from "@/models/PageVisitor.js";

/**
 * Record a visit to a page.
 * @param {string} page - The page route/slug (e.g. "/artwork/123")
 * @param {boolean} isUnique - Whether this is a unique visitor
 */
export async function recordVisit(page, isUnique = false) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await PageVisitor.findOneAndUpdate(
    { page },
    {
      $inc: {
        totalVisits: 1,
        ...(isUnique && { uniqueVisitors: 1 }),
      },
    },
    { upsert: true, new: true },
  );

  const updated = await PageVisitor.findOneAndUpdate(
    { page, "dailyStats.date": today },
    {
      $inc: {
        "dailyStats.$.visits": 1,
        ...(isUnique && { "dailyStats.$.uniqueVisitors": 1 }),
      },
    },
    { new: true },
  );

  if (!updated) {
    await PageVisitor.findOneAndUpdate(
      { page },
      {
        $push: {
          dailyStats: {
            date: today,
            visits: 1,
            uniqueVisitors: isUnique ? 1 : 0,
          },
        },
      },
    );
  }
}

/**
 * Get total visit stats for a specific page.
 * @param {string} page
 */
export async function getPageStats(page) {
  const doc = await PageVisitor.findOne({ page }).lean();
  if (!doc) return null;

  return {
    page: doc.page,
    totalVisits: doc.totalVisits,
    uniqueVisitors: doc.uniqueVisitors,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Get daily breakdown for a page, optionally filtered by date range.
 * @param {string} page
 * @param {Date} [from]
 * @param {Date} [to]
 */
export async function getDailyStats(page, from, to) {
  const doc = await PageVisitor.findOne({ page }).lean();
  if (!doc) return [];

  let stats = doc.dailyStats;

  if (from || to) {
    stats = stats.filter((entry) => {
      const date = new Date(entry.date);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });
  }

  return stats.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Get stats for all tracked pages, sorted by total visits descending.
 */
export async function getAllPagesStats() {
  const docs = await PageVisitor.find({})
    .select("page totalVisits uniqueVisitors updatedAt")
    .lean();

  return docs.sort((a, b) => b.totalVisits - a.totalVisits);
}

/**
 * Reset stats for a specific page. Use with caution.
 * @param {string} page
 */
export async function resetPageStats(page) {
  await PageVisitor.findOneAndUpdate(
    { page },
    {
      $set: {
        totalVisits: 0,
        uniqueVisitors: 0,
        dailyStats: [],
      },
    },
  );
}
