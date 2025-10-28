import mongoose, { Schema, models } from "mongoose";

const productoSchema = new Schema(
  {
    referencia: { type: String, required: true },
    nombre: { type: String, required: true },
    precioActual: { type: Number, required: false },
    precioAnterior: { type: Number, default: null },
    fechaActualizacion: { type: Date, default: Date.now },
  },
  { versionKey: false } // elimina "__v"
);

// Forzar recarga del modelo si ya existe en caché
delete mongoose.connection.models["Producto"];

const Producto = models.Producto || mongoose.model("Producto", productoSchema);

export default Producto;
