import mongoose, { Schema, models } from "mongoose";

//Types
import { InvoiceSchema, ProductSchema } from "./Invoice.types";

const ProductSchema = new Schema<ProductSchema>({
  reference_code: String,
  name: String,
  price: String,
});

const InvoiceSchema = new Schema<InvoiceSchema>({
  date: { type: String, required: true },
  total_price: { type: Number, required: true },
  product: { type: [ProductSchema], default: [] },
});

export const Invoice =
  models.Invoice || mongoose.model("Invoice", InvoiceSchema);
