import { Document } from "mongoose";

export interface ProductSchema extends Document {
  reference_code: string;
  name: string;
  current_price: number;
  last_price: number;
  updated_at: string;
}
