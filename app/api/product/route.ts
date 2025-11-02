import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

//Models
import { Product } from "@/models/ProductSchema/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ updated_at: -1 });

    return NextResponse.json({
      message: "Productos cargados exitosamente.",
      data: products,
    });
  } catch (err) {
    console.error(err);
  }
}
