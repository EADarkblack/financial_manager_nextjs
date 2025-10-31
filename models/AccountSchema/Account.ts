import mongoose, { Schema, Model } from "mongoose";

//Types
import { AccountSchema, TransactionHistorySchema } from "./Account.types";

const TransactionHistorySchema = new Schema<TransactionHistorySchema>({
  date: { type: String, required: true },
  balance: { type: Number, required: true },
});

const AccountSchema = new Schema<AccountSchema>({
  name: { type: String, required: true, unique: true },
  balance: { type: Number, required: true },
  transaction_history: { type: [TransactionHistorySchema], default: [] },
});

export const Account: Model<AccountSchema> =
  mongoose.models.Account ||
  mongoose.model<AccountSchema>("Account", AccountSchema);
