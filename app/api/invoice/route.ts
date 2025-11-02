import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

//Models
import { Invoice } from "@/models/InvoiceSchema/Invoice";
import { Product } from "@/models/ProductSchema/Product";

//Types
import { ProductSchema } from "@/models/InvoiceSchema/Invoice.types";

export async function GET() {
  try {
    await connectDB();

    const invoices = await Invoice.find().sort({ date: -1 });

    return NextResponse.json({
      message: "Facturas cargadas exitosamente.",
      data: invoices,
    });
  } catch (err) {
    console.error(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectDB();

    const newInvoice = new Invoice({
      date: body.date,
      total_price: body.total_price,
      product: body.products,
    });

    await newInvoice.save();

    const uniqueProducts = Array.from(
      new Map(
        body.products.map((product: ProductSchema) => [
          product.reference_code,
          product,
        ])
      ).values()
    );

    for (const product of uniqueProducts) {
      const cleanPrice = Number(
        (product as ProductSchema).price.replace(/,/g, "")
      );

      const productByReferenceCode = await Product.findOne({
        reference_code: (product as ProductSchema).reference_code,
      });

      if (productByReferenceCode) {
        await Product.updateOne(
          { _id: productByReferenceCode._id },
          {
            $set: {
              last_price: productByReferenceCode.current_price,
              current_price: cleanPrice,
              updated_at: body.date,
            },
          }
        );
      } else {
        const newProduct = new Product({
          reference_code: (product as ProductSchema).reference_code,
          name: (product as ProductSchema).name,
          current_price: cleanPrice,
          last_price: null,
          updated_at: body.date,
        });

        await newProduct.save();
      }
    }

    return NextResponse.json({
      data: newInvoice,
      message: "Factura guardada exitosamente.",
    });
  } catch (err) {
    console.error(err);
  }
}
