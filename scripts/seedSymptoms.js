// scripts/seedSymptoms.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const USER_ID = '69bc130abdcd059844b6ed1d';
const symptomDaySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    symptoms: {
      average: { type: Number, min: 0, max: 10, default: null },
      moderateExacerbation: { type: Boolean, default: false },
      seriousExacerbation: { type: Boolean, default: false },
      physicalActivity: { type: Number, min: 0, max: 10, default: null },
      medication: { type: Boolean, default: false },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

symptomDaySchema.index({ userId: 1, date: 1 }, { unique: true });

const SymptomDay =
  mongoose.models.SymptomDay || mongoose.model("SymptomDay", symptomDaySchema);

const USER_NAME = "test-user";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

// Simulate realistic COPD patterns:
// - baseline mild symptoms most days
// - occasional moderate exacerbations
// - rare serious exacerbations
// - medication taken most days
// - physical activity varies
function generateDayData(date) {
  const rand = Math.random();

  // ~10% chance of serious exacerbation
  const seriousExacerbation = rand < 0.1;

  // ~25% chance of moderate exacerbation (but not on serious days)
  const moderateExacerbation = !seriousExacerbation && rand < 0.35;

  // Symptom average is higher on exacerbation days
  let average;
  if (seriousExacerbation) {
    average = randomFloat(7, 10);
  } else if (moderateExacerbation) {
    average = randomFloat(4, 6.9);
  } else {
    average = randomFloat(0, 3.9);
  }

  // Physical activity is lower on bad days
  let physicalActivity;
  if (seriousExacerbation) {
    physicalActivity = randomFloat(0, 2);
  } else if (moderateExacerbation) {
    physicalActivity = randomFloat(2, 5);
  } else {
    physicalActivity = randomFloat(4, 10);
  }

  // Medication taken ~85% of days, always on exacerbation days
  const medication =
    seriousExacerbation || moderateExacerbation || Math.random() < 0.85;

  const notes = seriousExacerbation
    ? "Severe breathlessness, needed rest all day."
    : moderateExacerbation
      ? "More coughing than usual, tired."
      : "";

  return {
    userId: USER_ID,
    date,
    symptoms: {
      average,
      moderateExacerbation,
      seriousExacerbation,
      physicalActivity,
      medication,
    },
    notes,
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing test data
  await SymptomDay.deleteMany({ userId: USER_ID });
  console.log("Cleared existing seed data");

  const today = new Date();
  const entries = [];

  // Generate last 90 days
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Skip ~10% of days (no data recorded)
    if (Math.random() < 0.1) continue;

    entries.push(generateDayData(date));
  }

  await SymptomDay.insertMany(entries);
  console.log(
    `Seeded ${entries.length} days of symptom data for user "${USER_ID}"`,
  );

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
