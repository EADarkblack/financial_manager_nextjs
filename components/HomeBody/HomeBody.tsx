"use client";

import { useEffect, useState } from "react";

//Components
import SideBarComponent from "../SideBarComponent/SideBarComponent";
import FilterByPeriodComponent from "../FilterByPeriodComponent/FilterByPeriodComponent";
import AccountCardComponent from "../AccountCardComponent/AccountCardComponent";
import ChartByPeriodComponent from "../ChartByPeriodComponent/ChartByPeriodComponent";
import TransactionHistoryTableComponent from "../TransactionHistoryTableComponent/TransactionHistoryTableComponent";

//Types
import { Account, ChartData } from "./HomeBody.types";

//Utils
import { dateFormatter } from "../../utils/functions/dateFormatter";

const HomeBody = () => {
  const [accountSelected, setAccountSelected] = useState<string | null>(null);
  const [periodSelected, setPeriodSelected] = useState<
    "Semana" | "Mes" | "Semestre" | "Año"
  >("Semana");
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<[]>([]);

  const AVAILABLE_PERIODS = ["Semana", "Mes", "Semestre", "Año"];

  let chartData: ChartData[] = [];

  const getAccountsFromDatabase = async () => {
    try {
      const response = await fetch("/api/account");
      const result = await response.json();

      switch (result?.message) {
        case "Cuentas obtenidas exitosamente.":
          const accountWithState = result.data.map((account: Account) => ({
            ...account,
            editing: false,
          }));

          setAccountList(accountWithState);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      //TODO: Agregar estado de pantalla de carga
    }
  };

  const getTransactionHistory = async () => {
    try {
      const response = await fetch("/api/transaction_history");
      const result = await response.json();

      switch (result?.message) {
        case "Historial de transacciones cargado exitosamente.":
          setTransactions(result.data);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAccountsFromDatabase();
    getTransactionHistory();
  }, []);

  const handleEditAccountCard = (index: number) => {
    const modifiedAccountList = [...accountList];

    accountList[index].editing = true;

    setAccountList(modifiedAccountList);
  };

  const handleCancelEditAccountCard = (index: number) => {
    const modifiedAccountList = [...accountList];

    modifiedAccountList[index].editing = false;

    setAccountList(modifiedAccountList);
  };

  const handleSaveEditAccountCard = async (
    index: number,
    newBalance: number
  ) => {
    const modifiedAccountList = [...accountList];

    modifiedAccountList[index].balance = newBalance;
    modifiedAccountList[index].editing = false;

    setAccountList(modifiedAccountList);

    const modifiedAccount = modifiedAccountList[index];

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modifiedAccount.name,
          balance: modifiedAccount.balance,
        }),
      });

      const result = await response.json();

      switch (result?.message) {
        case "Cuenta registrada exitosamente.":
          getAccountsFromDatabase();
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeEditAccountCard = (index: number, value: string) => {
    const modifiedAccountList = [...accountList];

    modifiedAccountList[index].balance =
      parseInt(value.replace(/\D/g, "")) || 0;

    setAccountList(modifiedAccountList);
  };

  const getChartByPeriod = (account: Account): ChartData[] => {
    const data: ChartData[] = [];

    let lastBalance: number | null = null;

    const today = new Date();

    let days = 7;

    switch (periodSelected) {
      case "Mes":
        days = 30;
        break;
      case "Semestre":
        days = 180;
        break;
      case "Año":
        days = 365;
        break;
    }

    const transactionHistoryFiltered = account.transaction_history
      .filter((transactionHistory) => {
        const transactionDate = new Date(
          dateFormatter(transactionHistory.date, true)
        );

        return (
          (today.getTime() - transactionDate.getTime()) /
            (1000 * 60 * 60 * 24) <=
          days
        );
      })
      .sort(
        (firstElement, secondElement) =>
          new Date(firstElement.date).getTime() -
          new Date(secondElement.date).getTime()
      );

    transactionHistoryFiltered.forEach((transaction) => {
      if (lastBalance === null || transaction.balance !== lastBalance) {
        data.push({
          date: dateFormatter(transaction.date, true),
          balance: transaction.balance,
        });

        lastBalance = transaction.balance;
      }
    });

    return data;
  };

  if (accountSelected) {
    const account = accountList.find(
      (account) => account.name === accountSelected
    );

    if (account) {
      chartData = getChartByPeriod(account);
    }
  } else {
    const dates = Array.from(
      new Set(
        accountList.flatMap((account) =>
          getChartByPeriod(account).map((date) => date.date)
        )
      )
    ).sort();

    chartData = dates.map((date) => {
      const total = accountList.reduce((accumulator, account) => {
        const lastTransaction = account.transaction_history
          .filter((history) => {
            const historyDate = new Date(dateFormatter(history.date, true));
            const currentDate = new Date(dateFormatter(date, true));
            return historyDate.getTime() <= currentDate.getTime();
          })
          .sort(
            (a, b) =>
              new Date(dateFormatter(b.date, true)).getTime() -
              new Date(dateFormatter(a.date, true)).getTime()
          )[0];

        return accumulator + (lastTransaction?.balance || 0);
      }, 0);

      return { date: date, balance: 0, total: total };
    });
  }

  return (
    <div className="flex h-screen bg-[#0D1117] text-[#E5E7EB]">
      <SideBarComponent />

      <div className="flex flex w-full h-[100vh] justify-center">
        <main className="flex flex-col w-[1004px] justify-start mt-6">
          <h2 className="text-3xl font-semibold mb-4 text-[#3B82F6]">
            Historial de gastos
          </h2>

          <FilterByPeriodComponent
            availablePeriods={AVAILABLE_PERIODS}
            setPeriodSelected={setPeriodSelected}
            periodSelected={periodSelected}
          />

          <AccountCardComponent
            accountList={accountList}
            setAccountSelected={setAccountSelected}
            handleChangeEditAccountCard={handleChangeEditAccountCard}
            handleSaveEditAccountCard={handleSaveEditAccountCard}
            handleCancelEditAccountCard={handleCancelEditAccountCard}
            handleEditAccountCard={handleEditAccountCard}
          />

          <ChartByPeriodComponent
            accountSelected={accountSelected}
            setAccountSelected={setAccountSelected}
            chartData={chartData}
          />

          <TransactionHistoryTableComponent transactions={transactions} />
        </main>
      </div>
    </div>
  );
};

export default HomeBody;
