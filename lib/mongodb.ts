import mongoose from "mongoose";
import { MONGODB_URI } from "@/constants/constants";

if (!MONGODB_URI)
  throw new Error("La url de la base de datos no fue encontrada.");

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "financial_manager",
    });

    isConnected = true;
    console.log("Conectado a la base de datos.");
  } catch (err) {
    console.error(err);
  }
};
