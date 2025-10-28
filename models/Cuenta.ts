import mongoose, { Schema, model, models } from "mongoose";

const HistorialSchema = new Schema({
  fecha: { type: String, required: true },
  saldo: { type: Number, required: true },
});

const CuentaSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  saldo: { type: Number, required: true },
  historial: [HistorialSchema],
});

export const Cuenta = models.Cuenta || model("Cuenta", CuentaSchema);
