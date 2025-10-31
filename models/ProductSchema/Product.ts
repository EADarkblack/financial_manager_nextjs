import mongoose, { Schema, models } from "mongoose";

//Types
import { ProductSchema } from "./Product.types";

const ProductSchema = new Schema<ProductSchema>({
  reference_code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  current_price: { type: Number, required: true },
  last_price: { type: Number, default: null },
  updated_at: { type: String, default: null },
});

export const Product =
  models.Product || mongoose.model("Product", ProductSchema);
