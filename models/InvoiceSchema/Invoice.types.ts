import { Document } from "mongoose";

export interface ProductSchema {
  reference_code: string;
  name: string;
  price: string;
}

export interface InvoiceSchema extends Document {
  date: string;
  total_price: number;
  product: ProductSchema[];
}
