import mongoose, { Model, Schema } from "mongoose";

//Types
import { ProductSchema } from "./Product.types";

const ProductSchema = new Schema<ProductSchema>({
  reference_code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  current_price: { type: Number, required: true },
  last_price: { type: Number, default: null },
  updated_at: { type: String, default: null },
});

export const Product: Model<ProductSchema> =
  mongoose.models.Product ||
  mongoose.model<ProductSchema>("Product", ProductSchema);
