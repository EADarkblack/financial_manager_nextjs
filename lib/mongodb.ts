import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://wilmarmiguez:Lob5htxKfEo59WV4@db-formulario.q9lt6h6.mongodb.net/";

if (!MONGODB_URI) {
  throw new Error("⚠️ Debes definir la variable de entorno MONGODB_URI");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "financial_manager", // 👈 nombre de tu base en Atlas
    });
    isConnected = true;
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
  }
};
