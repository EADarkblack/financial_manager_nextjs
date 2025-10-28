import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Cuenta } from "@/models/Cuenta";

export async function GET() {
  await connectDB();

  // Verificar si existen cuentas en la base de datos
  let cuentas = await Cuenta.find();

  if (cuentas.length === 0) {
    console.log("⚙️ Creando cuentas por defecto...");

    const hoy = new Date().toISOString().split("T")[0];

    const cuentasIniciales = [
      {
        nombre: "Bancolombia",
        saldo: 0,
        historial: [{ fecha: hoy, saldo: 0 }],
      },
      { nombre: "Nequi", saldo: 0, historial: [{ fecha: hoy, saldo: 0 }] },
      { nombre: "Efectivo", saldo: 0, historial: [{ fecha: hoy, saldo: 0 }] },
    ];

    await Cuenta.insertMany(cuentasIniciales);
    cuentas = await Cuenta.find();
  }

  return NextResponse.json(cuentas);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  // Buscar si ya existe la cuenta
  let cuenta = await Cuenta.findOne({ nombre: data.nombre });

  const hoy = new Date().toISOString().split("T")[0];

  if (cuenta) {
    // Actualizar saldo
    cuenta.saldo = data.saldo;

    // Ver si ya hay registro para hoy
    const idx = cuenta.historial.findIndex((h: any) => h.fecha === hoy);
    if (idx >= 0) cuenta.historial[idx].saldo = data.saldo;
    else cuenta.historial.push({ fecha: hoy, saldo: data.saldo });

    await cuenta.save();
  } else {
    // Crear cuenta nueva
    cuenta = new Cuenta({
      nombre: data.nombre,
      saldo: data.saldo,
      historial: [{ fecha: hoy, saldo: data.saldo }],
    });
    await cuenta.save();
  }

  return NextResponse.json({ message: "Cuenta guardada con éxito", cuenta });
}
