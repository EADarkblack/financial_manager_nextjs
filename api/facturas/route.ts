import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Factura from "@/models/InvoiceSchema/Invoice";
import Producto from "@/models/ProductSchema/Product";

export async function GET() {
  try {
    await connectDB();
    const facturas = await Factura.find().sort({ fecha: -1 }); // las más recientes primero
    return NextResponse.json({ success: true, facturas });
  } catch (err) {
    console.error("❌ Error obteniendo facturas:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();

    // 1️⃣ Guardar la factura completa (con duplicados)
    const nuevaFactura = new Factura({
      fecha: body.fecha,
      total: body.total,
      productos: body.productos,
    });

    await nuevaFactura.save();

    // 2️⃣ Procesar productos únicos
    const uniqueProducts = Array.from(
      new Map(body.productos.map((p: any) => [p.referencia, p])).values()
    );

    for (const p of uniqueProducts) {
      // Limpia el precio: quita comas, convierte a número
      const precioLimpio = Number(String(p.precio).replace(/,/g, ""));

      const productoExistente = await Producto.findOne({
        referencia: p.referencia,
      });

      if (productoExistente) {
        await Producto.updateOne(
          { _id: productoExistente._id },
          {
            $set: {
              precioAnterior: productoExistente.precioActual,
              precioActual: precioLimpio,
              fechaActualizacion: body.fecha,
            },
          }
        );
      } else {
        const nuevoProducto = new Producto({
          referencia: p.referencia,
          nombre: p.nombre,
          precioActual: precioLimpio,
          precioAnterior: null,
          fechaActualizacion: body.fecha,
        });

        await nuevoProducto.save();
      }
    }

    return NextResponse.json({
      success: true,
      factura: nuevaFactura,
      message: "Factura y productos actualizados correctamente ✅",
    });
  } catch (err) {
    console.error("❌ Error en /api/facturas:", err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
