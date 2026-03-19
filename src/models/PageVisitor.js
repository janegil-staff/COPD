// src/models/PageVisitor.js

import mongoose from 'mongoose';

const pageVisitorSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    dailyStats: [
      {
        date: {
          type: Date,
          required: true,
        },
        visits: {
          type: Number,
          default: 0,
        },
        uniqueVisitors: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

pageVisitorSchema.index({ page: 1, 'dailyStats.date': 1 });

// ✅ Reuse the model if already compiled (hot reload safe)
const PageVisitor = mongoose.models.PageVisitor || mongoose.model('PageVisitor', pageVisitorSchema);

export default PageVisitor;