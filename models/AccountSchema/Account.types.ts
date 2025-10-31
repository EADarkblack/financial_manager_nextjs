import { Document } from "mongoose";

export interface TransactionHistorySchema {
  date: string;
  balance: number;
}

export interface AccountSchema extends Document {
  name: string;
  balance: number;
  transaction_history: TransactionHistorySchema[];
}
