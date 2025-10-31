import { useState } from "react";

//Types
import { TransactionHistory } from "../HomeBody/HomeBody.types";
import { TransactionHistoryTableComponentProps } from "./TransactionHistoryTableComponent.types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TransactionHistoryTableComponent: React.FC<
  TransactionHistoryTableComponentProps
> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedTransactions = transactions
    .slice()
    .reverse()
    .slice(startIndex, endIndex);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-[#161B22] p-4 rounded shadow border border-[#1F2937] mt-6">
      <h3 className="text-xl font-bold mb-4 text-[#E5E7EB]">
        Historial de Transacciones
      </h3>

      {transactions.length === 0 ? (
        <p className="text-[#9CA3AF]">No hay transacciones registradas.</p>
      ) : (
        <>
          <div className="min-h-[25px]">
            <table className="min-w-full border border-[#1F2937] text-sm">
              <thead className="bg-[#1F2937] text-[#E5E7EB]">
                <tr>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Recibe</th>
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(
                  (transaction: TransactionHistory) => (
                    <tr
                      key={transaction._id}
                      className="border-t border-[#374151] hover:bg-[#1F2937] transition-colors"
                    >
                      <td className="p-2">{transaction.date}</td>
                      <td className="p-2">{transaction.receiver}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td
                        className={`p-2 text-right font-semibold ${
                          transaction.type === "transfer_in"
                            ? "text-[#10B981]"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "transfer_in" ? "+" : "-"}$
                        {transaction.value.toLocaleString("es-CO")}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 text-[#E5E7EB]">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md transition ${
                currentPage === 1
                  ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
                  : "bg-[#1F2937] hover:bg-[#374151]"
              }`}
              title="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm">
              Página <strong>{currentPage}</strong> de {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md transition ${
                currentPage === totalPages
                  ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
                  : "bg-[#1F2937] hover:bg-[#374151]"
              }`}
              title="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionHistoryTableComponent;
