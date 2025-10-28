import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductoOCR from "@/models/ProductosOCR";

export async function GET() {
  try {
    await connectDB();
    const productos = await ProductoOCR.find().sort({ fechaActualizacion: -1 });
    return NextResponse.json({ success: true, productos });
  } catch (error) {
    console.error("Error al traer productos:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { productos } = await req.json();

    const resultados = [];

    for (const p of productos) {
      const precioNuevo = parseFloat(p.precio.replace(/[^\d]/g, "")) || 0;

      // Buscar producto por referencia o nombre
      const productoExistente = await ProductoOCR.findOne({
        referencia: p.referencia,
      });

      if (productoExistente) {
        // Guardar comparativa de precios
        const precioAnterior = productoExistente.precioActual;
        productoExistente.precioAnterior = precioAnterior;
        productoExistente.precioActual = precioNuevo;
        productoExistente.fechaActualizacion = new Date();
        await productoExistente.save();

        resultados.push({
          ...p,
          cambio:
            precioNuevo > precioAnterior
              ? "subió"
              : precioNuevo < precioAnterior
              ? "bajó"
              : "igual",
        });
      } else {
        // Crear nuevo producto
        await ProductoOCR.create({
          referencia: p.referencia,
          nombre: p.nombre,
          precioActual: precioNuevo,
        });

        resultados.push({ ...p, cambio: "nuevo" });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Productos guardados correctamente",
      resultados,
    });
  } catch (error) {
    console.error("Error guardando productos:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
