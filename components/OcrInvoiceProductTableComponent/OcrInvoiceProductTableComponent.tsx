"use client";

import {
  Save,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

//Types
import { OcrInvoiceProductTableComponentProps } from "./OcrInvoiceProductTableComponent.types";

const OcrInvoiceProductTableComponent: React.FC<
  OcrInvoiceProductTableComponentProps
> = ({
  items,
  sortOrder,
  setSortOrder,
  sortedItems,
  editingIndex,
  editValues,
  setEditValues,
  handleSaveEditProduct,
  handleCancelEditProduct,
  handleEditProduct,
  handleDeleteProduct,
  handleSaveInvoice,
  handleResetOcr,
  totalOfProducts,
  totalPrice,
}) => {
  if (items.length === 0) return null;

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-[#161B22] p-4 rounded shadow border border-[#1F2937] mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#E5E7EB] flex items-center gap-2">
          Productos
        </h3>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#E5E7EB] text-sm">
            Filtro por precio:
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "default" | "asc" | "desc")
            }
            className="bg-[#1F2937] border border-[#374151] text-[#E5E7EB] text-sm rounded-md px-2 py-1 outline-none hover:bg-[#2A303C] transition cursor-pointer"
          >
            <option value="default">Por defecto</option>
            <option value="desc">De mayor a menor</option>
            <option value="asc">De menor a mayor</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-[#1F2937] text-sm rounded">
          <thead className="bg-[#1F2937] text-[#E5E7EB]">
            <tr>
              <th className="p-2 text-left">Referencia</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Precio</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index;

              return (
                <tr
                  key={globalIndex}
                  className="border-t border-[#374151] hover:bg-[#1F2937] transition-colors"
                >
                  <td className="p-2">
                    {editingIndex === globalIndex ? (
                      <input
                        value={editValues.reference_code}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            reference_code: e.target.value,
                          })
                        }
                        className="w-full p-1 rounded bg-[#0D1117] border border-[#1F2937] outline-none text-[#E5E7EB]"
                      />
                    ) : (
                      item.reference_code
                    )}
                  </td>

                  <td className="p-2">
                    {editingIndex === globalIndex ? (
                      <input
                        value={editValues.name}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-1 rounded bg-[#0D1117] border border-[#1F2937] outline-none text-[#E5E7EB]"
                      />
                    ) : (
                      item.name
                    )}
                  </td>

                  <td className="p-2 text-right">
                    {editingIndex === globalIndex ? (
                      <input
                        value={editValues.price}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            price: e.target.value,
                          })
                        }
                        className="w-full p-1 rounded bg-[#0D1117] border border-[#1F2937] outline-none text-[#E5E7EB] text-right"
                      />
                    ) : (
                      `$${item.price}`
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {editingIndex === globalIndex ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSaveEditProduct(globalIndex)}
                          className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition cursor-pointer"
                          title="Guardar cambios"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEditProduct}
                          className="p-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditProduct(globalIndex)}
                          className="p-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(globalIndex)}
                          className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#E5E7EB]">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded cursor-pointer ${
            currentPage === 1
              ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
              : "bg-[#1F2937] hover:bg-[#374151]"
          }`}
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded cursor-pointer ${
            currentPage === totalPages
              ? "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
              : "bg-[#1F2937] hover:bg-[#374151]"
          }`}
          title="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
        <div className="flex gap-2">
          <button
            onClick={handleSaveInvoice}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition cursor-pointer"
          >
            <Save size={16} />
            Guardar factura
          </button>
          <button
            onClick={handleResetOcr}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition cursor-pointer"
          >
            <RefreshCw size={16} />
            Reiniciar
          </button>
        </div>

        <div className="bg-[#1F2937] border border-[#374151] rounded p-3 text-[#E5E7EB] text-sm shadow">
          <p>
            <strong>Número de productos:</strong> {totalOfProducts}
          </p>
          <p>
            <strong>Total:</strong> ${totalPrice.toLocaleString("es-CO")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OcrInvoiceProductTableComponent;
