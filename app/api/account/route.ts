import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

//Models
import { Account } from "@/models/AccountSchema/Account";

//Utils
import {
  dateFormatter,
  getLocalDateString,
} from "@/utils/functions/dateFormatter";

export async function GET() {
  await connectDB();

  let accountList = await Account.find();

  if (accountList.length === 0) {
    const today = dateFormatter(getLocalDateString());

    const defaultAccounts = [
      {
        name: "Bancolombia",
        balance: 0,
        transaction_history: [{ date: today, balance: 0 }],
      },
      {
        name: "Nequi",
        balance: 0,
        transaction_history: [{ date: today, balance: 0 }],
      },
      {
        name: "Efectivo",
        balance: 0,
        transaction_history: [{ date: today, balance: 0 }],
      },
    ];

    await Account.insertMany(defaultAccounts);

    accountList = await Account.find();
  }

  return NextResponse.json({
    message: "Cuentas obtenidas exitosamente.",
    data: accountList,
  });
}

export async function POST(req: Request) {
  await connectDB();

  const { name, balance } = await req.json();

  let account = await Account.findOne({ name: name });

  const today = dateFormatter(getLocalDateString());

  if (account) {
    account.balance = balance;

    const todayIndexRegister = account.transaction_history.findIndex(
      (transaction_history: any) => transaction_history.date === today
    );

    if (todayIndexRegister >= 0) {
      account.transaction_history[todayIndexRegister].balance = balance;
    } else {
      account.transaction_history.push({ date: today, balance: balance });
    }

    await account.save();
  } else {
    account = new Account({
      name: name,
      balance: balance,
      transaction_history: [{ date: today, balance: balance }],
    });
    await account.save();
  }

  return NextResponse.json({
    message: "Cuenta registrada exitosamente.",
    data: account,
  });
}
