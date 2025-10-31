import mongoose, { Model } from "mongoose";

//Types
import { TransactionHistorySchema } from "./TransactionHistory.types";

const TransactionHistorySchema = new mongoose.Schema<TransactionHistorySchema>({
  date: { type: String, required: true },
  value: { type: Number, required: true },
  receiver: { type: String, required: true },
  type: {
    type: String,
    enum: ["transfer_in", "transfer_out", "purchase"],
    required: true,
  },
  description: { type: String, required: true },
});

export const TransactionHistory =
  mongoose.models.TransactionHistory ||
  (mongoose.model(
    "TransactionHistory",
    TransactionHistorySchema
  ) as unknown as Model<TransactionHistorySchema & Document>);
