import mongoose from "mongoose";

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

export default SymptomDay;
