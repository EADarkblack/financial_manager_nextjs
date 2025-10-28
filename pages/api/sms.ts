// /pages/api/sms.js
import { connectDB } from "@/lib/mongodb";
import { Cuenta } from "@/models/Cuenta";
import { HistorialTransaccion } from "@/models/HistorialTransaccion";

function parseAmountFromText(text) {
  const match = text.match(/\$([\d.,]+)/);
  if (!match) return null;
  let raw = match[1].trim();

  // Si viene con coma decimal al final tipo "3,772,000.00" (raro) o "3.772.000,00"
  // Normalizar: si tiene coma seguida de 2 dígitos al final -> tratar como separador decimal europeo
  if (/, \d{2}$/.test(raw)) {
    // fallback: si el formato es extraño
  }

  // Reglas practicas:
  // - Si termina en ".00" (ej: "1.00"), lo tomamos como 1 (el entero)
  // - Si termina en ",00" o ".00" -> eliminar decimales
  if (/\.\d{2}$/.test(raw) || /,\d{2}$/.test(raw)) {
    // eliminar la parte decimal
    raw = raw.replace(/[\.,]\d{2}$/, "");
  }

  // eliminar separadores de miles (puntos o comas)
  raw = raw.replace(/[.,]/g, "");
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

function extractOrigenFromMessage(message) {
  const m1 = message.match(
    /recibiste (?:un|una)?\s*(?:pago|ingreso|consignacion|dep[oó]sito)(?:\s*(?:de|por)\s+)?\s*([A-ZÁÉÍÓÚÑ0-9@#\-\_\s\.]+)/i
  );
  if (m1 && m1[1]) return m1[1].trim();

  const m2 = message.match(/desde el corresponsal\s+([A-ZÁÉÍÓÚÑ0-9\s\.\-]+)/i);
  if (m2 && m2[1]) return m2[1].trim();

  const m3 = message.match(/de\s+([A-ZÁÉÍÓÚÑ0-9\s\.\-]+)\s+por/i);
  if (m3 && m3[1]) return m3[1].trim();

  // fallback: si hay "por $..." buscar texto entre "por" y "$"
  const m4 = message.match(/por\s+([A-ZÁÉÍÓÑa-z0-9\s\.\-]+)\s*\$/i);
  if (m4 && m4[1]) return m4[1].trim();

  return "Desconocido";
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const body = req.body;
    console.log("SMS body:", body);

    const sender = String(body.sender || "");
    const message = String(body.message || body.mensaje || "");

    // 🔹 Solo procesar mensajes de Bancolombia (87400 o 85540)
    if (!["87400", "85540"].includes(sender)) {
      return res.status(200).json({
        ok: true,
        processed: false,
        reason: `Sender ${sender} not recognized`,
      });
    }

    const lower = message.toLowerCase();
    await connectDB();
    const hoy = new Date().toISOString().split("T")[0];

    // ---------------------------------------------------------
    // 🔹 CASO 1: TRANSFERISTE (salida)
    // ---------------------------------------------------------
    if (lower.includes("transferiste")) {
      const amountMatch = message.match(/\$([\d.,]+)/);
      if (!amountMatch)
        return res.status(400).json({ ok: false, message: "No amount found" });

      let rawAmount = amountMatch[1].trim();
      let amount = 0;

      if (/,\d{2}$/.test(rawAmount)) {
        rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
        amount = parseFloat(rawAmount);
      } else if (/\.\d{2}$/.test(rawAmount)) {
        amount = parseInt(rawAmount.split(".")[0]);
      } else {
        rawAmount = rawAmount.replace(/[.,]/g, "");
        amount = parseInt(rawAmount);
      }

      if (isNaN(amount) || amount <= 0)
        return res.status(400).json({ ok: false, message: "Invalid amount" });

      const destMatch =
        message.match(/llave\s*[:-]?\s*(\d{6,20})/i) ||
        message.match(/cuenta\s*\*?(\d{6,20})/i);
      const destNumber = destMatch ? destMatch[1] : null;

      const bancolombia = await Cuenta.findOne({ nombre: "Bancolombia" });
      if (!bancolombia)
        return res
          .status(404)
          .json({ ok: false, message: "Cuenta Bancolombia no encontrada" });

      const nuevoSaldoBancolombia = (bancolombia.saldo || 0) - amount;
      bancolombia.saldo = nuevoSaldoBancolombia;

      const idxB = bancolombia.historial.findIndex((h) => h.fecha === hoy);
      if (idxB >= 0) bancolombia.historial[idxB].saldo = nuevoSaldoBancolombia;
      else
        bancolombia.historial.push({
          fecha: hoy,
          saldo: nuevoSaldoBancolombia,
        });

      await bancolombia.save();

      const actions = [
        {
          cuenta: "Bancolombia",
          delta: -amount,
          nuevoSaldo: nuevoSaldoBancolombia,
        },
      ];

      if (destNumber === "3028370979") {
        const nequi = await Cuenta.findOne({ nombre: "Nequi" });
        if (!nequi)
          return res
            .status(404)
            .json({ ok: false, message: "Cuenta Nequi no encontrada" });

        const nuevoSaldoNequi = (nequi.saldo || 0) + amount;
        nequi.saldo = nuevoSaldoNequi;

        const idxN = nequi.historial.findIndex((h) => h.fecha === hoy);
        if (idxN >= 0) nequi.historial[idxN].saldo = nuevoSaldoNequi;
        else nequi.historial.push({ fecha: hoy, saldo: nuevoSaldoNequi });

        await nequi.save();

        actions.push({
          cuenta: "Nequi",
          delta: +amount,
          nuevoSaldo: nuevoSaldoNequi,
        });
      }

      await HistorialTransaccion.create({
        fecha: new Date(),
        valor: amount,
        origen: "Bancolombia",
        destino:
          destNumber === "3028370979"
            ? "Nequi (por nombre detectado)"
            : destNumber || "Desconocido",
        tipo: "transfer_out",
        descripcion: `Transferencia enviada${
          destNumber ? " hacia " + destNumber : ""
        }`,
        rawMessage: message,
        sender,
      });

      return res.status(200).json({
        ok: true,
        processed: true,
        type: "transfer_out",
        parsed: { amount, destNumber, sender },
        actions,
      });
    }

    // ---------------------------------------------------------
    // 🔹 CASO 2: RECIBISTE (entrada)
    // ---------------------------------------------------------
    if (lower.includes("recibiste")) {
      const amountMatch = message.match(/\$([\d.,]+)/);
      if (!amountMatch)
        return res.status(400).json({ ok: false, message: "No amount found" });

      let rawAmount = amountMatch[1].trim();
      let amount = 0;

      if (/,\d{2}$/.test(rawAmount)) {
        rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
        amount = parseFloat(rawAmount);
      } else if (/\.\d{2}$/.test(rawAmount)) {
        amount = parseInt(rawAmount.split(".")[0]);
      } else {
        rawAmount = rawAmount.replace(/[.,]/g, "");
        amount = parseInt(rawAmount);
      }

      if (isNaN(amount) || amount <= 0)
        return res.status(400).json({ ok: false, message: "Invalid amount" });

      const bancolombia = await Cuenta.findOne({ nombre: "Bancolombia" });
      if (!bancolombia)
        return res
          .status(404)
          .json({ ok: false, message: "Cuenta Bancolombia no encontrada" });

      const actions = [];

      const nuevoSaldoBancolombia = (bancolombia.saldo || 0) + amount;
      bancolombia.saldo = nuevoSaldoBancolombia;

      const idxB = bancolombia.historial.findIndex((h) => h.fecha === hoy);
      if (idxB >= 0) bancolombia.historial[idxB].saldo = nuevoSaldoBancolombia;
      else
        bancolombia.historial.push({
          fecha: hoy,
          saldo: nuevoSaldoBancolombia,
        });

      await bancolombia.save();

      actions.push({
        cuenta: "Bancolombia",
        delta: +amount,
        nuevoSaldo: nuevoSaldoBancolombia,
      });

      if (lower.includes("wilmar miguez bolanos")) {
        const nequi = await Cuenta.findOne({ nombre: "Nequi" });
        if (!nequi)
          return res
            .status(404)
            .json({ ok: false, message: "Cuenta Nequi no encontrada" });

        const nuevoSaldoNequi = (nequi.saldo || 0) - amount;
        nequi.saldo = nuevoSaldoNequi;

        const idxN = nequi.historial.findIndex((h) => h.fecha === hoy);
        if (idxN >= 0) nequi.historial[idxN].saldo = nuevoSaldoNequi;
        else nequi.historial.push({ fecha: hoy, saldo: nuevoSaldoNequi });

        await nequi.save();

        actions.push({
          cuenta: "Nequi",
          delta: -amount,
          nuevoSaldo: nuevoSaldoNequi,
        });
      }

      // extraer origen concreto (ej: empresa o persona)
      const origenExtraido = extractOrigenFromMessage(message);

      await HistorialTransaccion.create({
        fecha: new Date(),
        valor: amount,
        origen: origenExtraido,
        destino: "Bancolombia",
        tipo: "transfer_in",
        descripcion: `Entrada recibida (${origenExtraido})`,
        rawMessage: message,
        sender,
      });

      return res.status(200).json({
        ok: true,
        processed: true,
        type: "transfer_in",
        parsed: {
          amount,
          from: lower.includes("wilmar miguez bolanos")
            ? "WILMAR MIGUEZ BOLANOS (Nequi)"
            : "Externo",
          sender,
        },
        actions,
      });
    }

    // ---------------------------------------------------------
    // 🔹 CASO 3: COMPRA CON TARJETA DÉBITO
    // ---------------------------------------------------------
    if (lower.includes("compraste") && lower.includes("t.deb")) {
      const amountMatch = message.match(/\$([\d.,]+)/);
      if (!amountMatch)
        return res.status(400).json({ ok: false, message: "No amount found" });

      let rawAmount = amountMatch[1].trim();
      let amount = 0;

      if (/,\d{2}$/.test(rawAmount)) {
        rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
        amount = parseFloat(rawAmount);
      } else if (/\.\d{2}$/.test(rawAmount)) {
        amount = parseInt(rawAmount.split(".")[0]);
      } else {
        rawAmount = rawAmount.replace(/[.,]/g, "");
        amount = parseInt(rawAmount);
      }

      if (isNaN(amount) || amount <= 0)
        return res.status(400).json({ ok: false, message: "Invalid amount" });

      const bancolombia = await Cuenta.findOne({ nombre: "Bancolombia" });
      if (!bancolombia)
        return res
          .status(404)
          .json({ ok: false, message: "Cuenta Bancolombia no encontrada" });

      const nuevoSaldoBancolombia = (bancolombia.saldo || 0) - amount;
      bancolombia.saldo = nuevoSaldoBancolombia;

      const idxB = bancolombia.historial.findIndex((h) => h.fecha === hoy);
      if (idxB >= 0) bancolombia.historial[idxB].saldo = nuevoSaldoBancolombia;
      else
        bancolombia.historial.push({
          fecha: hoy,
          saldo: nuevoSaldoBancolombia,
        });

      await bancolombia.save();

      const sitioMatch = message.match(/en\s+([A-Z0-9ÁÉÍÓÚÑ\s\.\-]+)/i);
      const sitio = sitioMatch ? sitioMatch[1].trim() : "Comercio desconocido";

      await HistorialTransaccion.create({
        fecha: new Date(),
        valor: amount,
        origen: "Bancolombia", // gasto sale de Bancolombia
        destino: sitio,
        tipo: "compra",
        descripcion: `Compra en ${sitio}`,
        rawMessage: message,
        sender,
      });

      return res.status(200).json({
        ok: true,
        processed: true,
        type: "purchase",
        parsed: { amount, sender },
        actions: [
          {
            cuenta: "Bancolombia",
            delta: -amount,
            nuevoSaldo: nuevoSaldoBancolombia,
          },
        ],
      });
    }

    // ---------------------------------------------------------
    // Ninguna coincidencia
    // ---------------------------------------------------------
    return res.status(200).json({
      ok: true,
      processed: false,
      reason: "Message did not match any rule",
    });
  } catch (err) {
    console.error("❌ Error processing SMS:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
