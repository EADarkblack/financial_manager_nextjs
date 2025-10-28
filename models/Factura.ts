import mongoose, { Schema, models } from "mongoose";

const productoSchema = new Schema({
  referencia: String,
  nombre: String,
  precio: String,
});

const facturaSchema = new Schema({
  fecha: { type: Date, required: true },
  total: { type: Number, required: true },
  productos: [productoSchema],
});

const Factura = models.Factura || mongoose.model("Factura", facturaSchema);
export default Factura;
