// src/models/SecretCode.js

import mongoose from "mongoose";

const secretCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Auto-delete expired documents
secretCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SecretCode =
  mongoose.models.SecretCode || mongoose.model("SecretCode", secretCodeSchema);

export default SecretCode;
