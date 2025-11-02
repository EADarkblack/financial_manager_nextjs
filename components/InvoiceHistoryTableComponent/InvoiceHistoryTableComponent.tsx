"use client";

import { useState } from "react";
import { Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

//Types
import { InvoiceHistoryTableComponentProps } from "./InvoiceHistoryTableComponent.types";
import { Invoice } from "../InvoicesBody/InvoicesBody.types";

const InvoiceHistoryTableComponent: React.FC<
  InvoiceHistoryTableComponentProps
> = ({ invoice, setInvoiceSelected, invoiceSelected }) => {
  const ITEMS_PER_PAGE = 3;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(invoice.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentInvoices = invoice.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-[#161B22] p-5 rounded-lg border border-[#1F2937] shadow-md mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#E5E7EB]">
          Historial de Facturas
        </h3>

        <span className="text-xs text-[#9CA3AF]">
          {invoice.length} {invoice.length === 1 ? "factura" : "facturas"}
        </span>
      </div>

      {invoice.length === 0 ? (
        <p className="text-[#9CA3AF] text-sm text-center py-4">
          No hay facturas guardadas.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-[#1F2937]">
            <table className="w-full text-sm text-[#E5E7EB] border-collapse">
              <thead className="bg-[#1F2937] text-[#9CA3AF] text-xs uppercase">
                <tr>
                  <th className="py-2 px-4 text-left">Fecha</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">No de productos</th>
                  <th className="py-2 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((factura: Invoice) => (
                  <tr
                    key={factura._id}
                    className="hover:bg-[#1E2630] border-t border-[#1F2937] transition-colors"
                  >
                    <td className="px-4 py-2">{factura.date}</td>
                    <td className="px-4 py-2 text-[#10B981] font-medium">
                      ${factura.total_price.toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-2">{factura.product.length}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setInvoiceSelected(factura)}
                        className="inline-flex items-center justify-center p-2 rounded-md bg-[#1F2937] hover:bg-[#2C3440] transition text-[#E5E7EB] cursor-pointer"
                        title="Ver factura"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`p-2 rounded cursor-pointer ${
                  currentPage === 1
                    ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
                    : "bg-[#1F2937] hover:bg-[#374151]"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`p-2 rounded cursor-pointer ${
                  currentPage === totalPages
                    ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
                    : "bg-[#1F2937] hover:bg-[#374151]"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {invoiceSelected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#0D1117] w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-xl relative max-h-[85vh] overflow-y-auto border border-[#1F2937] shadow-2xl">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-[#1F2937] hover:bg-[#2C3440] text-[#E5E7EB] hover:text-white transition-all shadow-sm cursor-pointer"
              onClick={() => setInvoiceSelected(null)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-3 text-[#3B82F6]">
              Factura del {invoiceSelected.date}
            </h2>

            <p className="mb-5 text-[#E5E7EB] text-sm">
              <strong>Total:</strong>{" "}
              <span className="text-[#10B981] font-medium">
                ${invoiceSelected.total_price.toLocaleString("es-CO")}
              </span>
            </p>

            <div className="overflow-x-auto rounded-md border border-[#1F2937]">
              <table className="w-full text-sm border-collapse text-[#E5E7EB]">
                <thead className="bg-[#161B22] text-[#9CA3AF] text-xs uppercase">
                  <tr className="text-center">
                    <th className="border p-2">Referencia</th>
                    <th className="border p-2">Producto</th>
                    <th className="border p-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceSelected.product.map((product, index) => (
                    <tr
                      key={index}
                      className="text-center border-t border-[#1F2937] hover:bg-[#1E2630] transition"
                    >
                      <td className="p-2 text-[#9CA3AF]">
                        {product.reference_code}
                      </td>
                      <td className="p-2">{product.name}</td>
                      <td className="p-2 text-right text-[#10B981] font-medium">
                        ${product.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistoryTableComponent;
