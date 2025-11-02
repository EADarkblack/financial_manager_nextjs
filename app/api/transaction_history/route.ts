import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

//Models
import { TransactionHistory } from "@/models/TransactionHistorySchema/TransactionHistory";

export async function GET() {
  try {
    await connectDB();

    const transacciones = await TransactionHistory.find()
      .sort({ date: -1 })
      .limit(100);

    return NextResponse.json({
      message: "Historial de transacciones cargado exitosamente.",
      data: transacciones,
    });
  } catch (err) {
    console.error(err);
  }
}
