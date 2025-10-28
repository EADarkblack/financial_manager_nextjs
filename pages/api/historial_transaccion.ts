// /pages/api/historial_transaccion.js
import { connectDB } from "@/lib/mongodb";
import { HistorialTransaccion } from "@/models/HistorialTransaccion";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const transacciones = await HistorialTransaccion.find()
        .sort({ fecha: -1 })
        .limit(100); // puedes ajustar el límite
      return res.status(200).json({ ok: true, transacciones });
    }

    return res.status(405).json({ ok: false, message: "Método no permitido" });
  } catch (error) {
    console.error("❌ Error cargando historial:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno del servidor" });
  }
}
