import { Document } from "mongoose";

export interface TransactionHistorySchema extends Document {
  date: string;
  value: number;
  receiver: string;
  type: string;
  description: string;
}
