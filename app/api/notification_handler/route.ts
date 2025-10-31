import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

//Models
import { Account } from "@/models/AccountSchema/Account";
import { TransactionHistory } from "@/models/TransactionHistorySchema/TransactionHistory";

//Utils
import { dateFormatter } from "../../../utils/functions/dateFormatter";

function parseAmountFromText(text: string) {
  const match = text.match(/\$([\d.,]+)/);

  if (!match) return null;

  let rawText = match[1].trim();

  if (/^\d{1,3}(,\d{3})*(\.\d{2})?$/.test(rawText)) {
    rawText = rawText.replace(/\.\d{2}$/, "");
    rawText = rawText.replace(/,/g, "");

    return parseInt(rawText, 10);
  }

  if (/^\d{1,3}(\.\d{3})*(,\d{2})?$/.test(rawText)) {
    rawText = rawText.replace(/,\d{2}$/, "");
    rawText = rawText.replace(/\./g, "");

    return parseInt(rawText, 10);
  }

  rawText = rawText.replace(/[^\d]/g, "");

  const number = parseInt(rawText, 10);

  return isNaN(number) ? null : number;
}

function getTrasmitterNameFromMessage(message: string) {
  if (!message) return "";

  const firstMatchFromText = message.match(
    /recibiste (?:un|una)?\s*(?:pago|ingreso|consignacion|dep[oó]sito)(?:\s*(?:de|por)\s+)?\s*([A-ZÁÉÍÓÚÑ0-9@#\-\_\s\.]+)/i
  );

  if (firstMatchFromText && firstMatchFromText[1])
    return firstMatchFromText[1].trim();

  const secondMatchFromText = message.match(
    /desde el corresponsal\s+([A-ZÁÉÍÓÚÑ0-9\s\.\-]+)/i
  );

  if (secondMatchFromText && secondMatchFromText[1])
    return secondMatchFromText[1].trim();

  const thirdMatchFromText = message.match(
    /de\s+([A-ZÁÉÍÓÚÑ0-9\s\.\-]+)\s+por/i
  );

  if (thirdMatchFromText && thirdMatchFromText[1])
    return thirdMatchFromText[1].trim();

  const fourthMatchFromText = message.match(
    /por\s+([A-ZÁÉÍÓÑa-z0-9\s\.\-]+)\s*\$/i
  );

  if (fourthMatchFromText && fourthMatchFromText[1])
    return fourthMatchFromText[1].trim();

  return "Desconocido";
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { sender, message } = await req.json();

    if (sender === "85540" || sender === "87400") {
      const messageLowercased = message.toLowerCase();
      const today = new Date().toISOString().split("T")[0];
      const amount = parseAmountFromText(message) || 0;

      const bancolombiaAccount = await Account.findOne({
        name: "Bancolombia",
      });

      const nequiAccount = await Account.findOne({ name: "Nequi" });

      if (messageLowercased.includes("transferiste")) {
        const receiverMatchText =
          message.match(/llave\s*[:-]?\s*(\d{6,20})/i) ||
          message.match(/cuenta\s*\*?(\d{6,20})/i);

        const receiverValue = receiverMatchText?.[1] || null;

        if (!bancolombiaAccount)
          return NextResponse.json({
            message: "Cuenta Bancolombia no encontrada",
          });

        const bancolombiaNewBalance =
          (bancolombiaAccount.balance || 0) - amount;

        bancolombiaAccount.balance = bancolombiaNewBalance;

        const bancolombiaTransactionHistoryIndex =
          bancolombiaAccount.transaction_history.findIndex(
            (transaction_history) =>
              dateFormatter(transaction_history.date, true) === today
          );

        if (bancolombiaTransactionHistoryIndex >= 0)
          bancolombiaAccount.transaction_history[
            bancolombiaTransactionHistoryIndex
          ].balance = bancolombiaNewBalance;
        else
          bancolombiaAccount.transaction_history.push({
            date: today,
            balance: bancolombiaNewBalance,
          });

        await bancolombiaAccount.save();

        if (receiverValue === "3028370979") {
          if (!nequiAccount)
            return NextResponse.json({
              message: "Cuenta Nequi no encontrada.",
            });

          const nequiNewBalance = (nequiAccount.balance || 0) + amount;

          nequiAccount.balance = nequiNewBalance;

          const nequiTransactionHistoryIndex =
            nequiAccount.transaction_history.findIndex(
              (transaction_history) =>
                dateFormatter(transaction_history.date, true) === today
            );

          if (nequiTransactionHistoryIndex >= 0) {
            nequiAccount.transaction_history[
              nequiTransactionHistoryIndex
            ].balance = nequiNewBalance;
          } else {
            nequiAccount.transaction_history.push({
              date: today,
              balance: nequiNewBalance,
            });
          }

          await nequiAccount.save();

          await TransactionHistory.create({
            date: dateFormatter(today),
            value: amount,
            receiver: receiverValue || "Desconocido",
            type: "transfer_out",
            description: `Transferencia enviada hacia ${
              receiverValue || "Desconocido"
            }`,
          });

          return NextResponse.json({
            message: "Transferencia guardada exitosamente.",
          });
        }
      }

      if (messageLowercased.includes("recibiste")) {
        if (!bancolombiaAccount)
          return NextResponse.json({
            message: "Cuenta Bancolombia no encontrada",
          });

        const bancolombiaNewBalance =
          (bancolombiaAccount.balance || 0) + amount;

        bancolombiaAccount.balance = bancolombiaNewBalance;

        const bancolombiaIndexTransactionHistory =
          bancolombiaAccount.transaction_history.findIndex(
            (transaction_history) =>
              dateFormatter(transaction_history.date, true) === today
          );

        if (bancolombiaIndexTransactionHistory >= 0) {
          bancolombiaAccount.transaction_history[
            bancolombiaIndexTransactionHistory
          ].balance = bancolombiaNewBalance;
        } else {
          bancolombiaAccount.transaction_history.push({
            date: today,
            balance: bancolombiaNewBalance,
          });
        }

        await bancolombiaAccount.save();

        const transmitterName = getTrasmitterNameFromMessage(message);

        if (transmitterName.trim() === "WILMAR MIGUEZ BOLANOS") {
          if (!nequiAccount)
            return NextResponse.json({
              message: "Cuenta Nequi no encontrada.",
            });

          const nequiNewBalance = (nequiAccount.balance || 0) - amount;

          nequiAccount.balance = nequiNewBalance;

          const nequiIndexTransactionHistory =
            nequiAccount.transaction_history.findIndex(
              (transaction_history) =>
                dateFormatter(transaction_history.date, true) === today
            );

          if (nequiIndexTransactionHistory >= 0) {
            nequiAccount.transaction_history[
              nequiIndexTransactionHistory
            ].balance = nequiNewBalance;
          } else {
            nequiAccount.transaction_history.push({
              date: today,
              balance: nequiNewBalance,
            });
          }

          await nequiAccount.save();
        }

        await TransactionHistory.create({
          date: dateFormatter(today),
          value: amount,
          receiver: "Bancolombia",
          type: "transfer_in",
          description: `Transferencia recibida de (${transmitterName})`,
        });

        return NextResponse.json({
          message: "Transferencia guardada exitosamente.",
        });
      }

      if (messageLowercased.includes("compraste")) {
        if (!bancolombiaAccount)
          return NextResponse.json({
            message: "Cuenta Bancolombia no encontrada",
          });

        const commerceMatchFromText = message.match(
          /en\s+([A-Z0-9ÁÉÍÓÚÑ\s\.\-]+)/i
        );

        const commerceName =
          commerceMatchFromText?.[1].trim() || "Comercio desconocido";

        const bancolombiaNewBalance =
          (bancolombiaAccount.balance || 0) - amount;

        bancolombiaAccount.balance = bancolombiaNewBalance;

        const bancolombiaIndexTransactionHistory =
          bancolombiaAccount.transaction_history.findIndex(
            (transaction_history) =>
              dateFormatter(transaction_history.date, true) === today
          );

        if (bancolombiaIndexTransactionHistory >= 0) {
          bancolombiaAccount.transaction_history[
            bancolombiaIndexTransactionHistory
          ].balance = bancolombiaNewBalance;
        } else {
          bancolombiaAccount.transaction_history.push({
            date: today,
            balance: bancolombiaNewBalance,
          });
        }

        await bancolombiaAccount.save();

        await TransactionHistory.create({
          date: dateFormatter(today),
          value: amount,
          receiver: commerceName,
          type: "purchase",
          description: `Compra en ${commerceName}`,
        });

        return NextResponse.json({
          message: "Compra guardada exitosamente.",
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}
