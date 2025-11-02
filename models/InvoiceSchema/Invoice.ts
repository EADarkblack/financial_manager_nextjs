import mongoose, { Model, Schema } from "mongoose";

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

export const Invoice: Model<InvoiceSchema> =
  mongoose.models.Invoice ||
  mongoose.model<InvoiceSchema>("Invoice", InvoiceSchema);
