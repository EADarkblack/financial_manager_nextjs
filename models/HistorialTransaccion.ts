// /models/HistorialTransaccion.js
import mongoose from "mongoose";

const HistorialTransaccionSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: () => new Date() },
    valor: { type: Number, required: true }, // monto en pesos (Number)
    origen: { type: String, required: true }, // quien envía (empresa, nombre, numero)
    destino: { type: String, required: true }, // ejemplo: "Bancolombia" o "Nequi" o comercio
    tipo: {
      type: String,
      enum: ["transfer_in", "transfer_out", "compra", "otro"],
      required: true,
    },
    descripcion: { type: String }, // texto descriptivo o comercio
    rawMessage: { type: String }, // SMS completo para auditoría
    sender: { type: String }, // número que envió el SMS (87400, 85540...)
  },
  { timestamps: true }
);

export const HistorialTransaccion =
  mongoose.models.HistorialTransaccion ||
  mongoose.model("HistorialTransaccion", HistorialTransaccionSchema);
