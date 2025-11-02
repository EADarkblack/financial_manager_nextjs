"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

//Components
import SideBarComponent from "../SideBarComponent/SideBarComponent";

//Types
import { ProductFromDatabase } from "./ProductsBody.type";

const ProductsBody = () => {
  const [productList, setProductList] = useState<ProductFromDatabase[]>([]);
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">(
    "default"
  );

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 18;

  const totalPages = Math.ceil(productList.length / productsPerPage);

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const sortedProductList = [...productList].sort((a, b) => {
    if (sortOrder === "asc") return a.current_price - b.current_price;
    if (sortOrder === "desc") return b.current_price - a.current_price;
    return 0;
  });

  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = sortedProductList.slice(
    startIndex,
    startIndex + productsPerPage
  );

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch("/api/product");
        const result = await response.json();

        if (result?.message === "Productos cargados exitosamente.") {
          setProductList(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getProducts();
  }, []);

  return (
    <div className="flex h-screen bg-[#0D1117] text-[#E5E7EB] relative">
      <SideBarComponent />

      <div className="flex flex w-full h-[100vh] justify-center">
        <div className="flex flex-col w-[1004px] justify-start mt-6">
          <h1 className="text-3xl font-semibold mb-4 text-[#3B82F6]">
            Lista de productos
          </h1>

          {productList.length === 0 ? (
            <p className="text-[#9CA3AF] text-sm text-center py-4">
              No hay productos disponibles.
            </p>
          ) : (
            <div className="bg-[#161B22] p-5 rounded-lg border border-[#1F2937] shadow-md mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-[#E5E7EB]">
                  Productos registrados
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9CA3AF]">
                    {productList.length}{" "}
                    {productList.length === 1 ? "producto" : "productos"}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm text-[#9CA3AF]">
                      Filtro por precio:
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(
                          e.target.value as "default" | "asc" | "desc"
                        )
                      }
                      className="border rounded p-1 bg-[#161B22] border-[#1F2937] text-[#E5E7EB] text-sm cursor-pointer outline-none"
                    >
                      <option value="default">Por defecto</option>
                      <option value="desc">De mayor a menor</option>
                      <option value="asc">De menor a mayor</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-[#1F2937]">
                <table className="w-full text-sm text-[#E5E7EB] border-collapse">
                  <thead className="bg-[#1F2937] text-[#9CA3AF] text-xs uppercase">
                    <tr className="text-center">
                      <th className="py-2 px-4">Referencia</th>
                      <th className="py-2 px-4">Nombre del producto</th>
                      <th className="py-2 px-4">Precio actual</th>
                      <th className="py-2 px-4">Precio anterior</th>
                      <th className="py-2 px-4">Diferencia</th>
                      <th className="py-2 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => {
                      let feature = "nuevo";

                      if (product.last_price !== null) {
                        if (product.current_price > product.last_price)
                          feature = "subió";
                        else if (product.current_price < product.last_price)
                          feature = "bajó";
                        else feature = "igual";
                      }

                      return (
                        <tr
                          key={index}
                          className="text-center hover:bg-[#1E2630] border-t border-[#1F2937] transition-colors"
                        >
                          <td className="p-2 text-[#9CA3AF]">
                            {product.reference_code}
                          </td>
                          <td className="p-2">{product.name}</td>
                          <td className="p-2 text-[#10B981] font-medium">
                            ${product.current_price.toLocaleString("es-CO")}
                          </td>
                          <td className="p-2">
                            {product.last_price !== null
                              ? `$${product.last_price.toLocaleString("es-CO")}`
                              : "-"}
                          </td>
                          <td className="p-2">
                            {product.last_price !== null
                              ? `$${(
                                  product.current_price - product.last_price
                                ).toLocaleString("es-CO")}`
                              : "-"}
                          </td>
                          <td className="p-2 font-bold">
                            <div className="flex items-center justify-center gap-1">
                              {feature === "subió" && (
                                <>
                                  <ArrowUp size={16} className="text-red-500" />
                                  <span className="text-red-500">Subió</span>
                                </>
                              )}

                              {feature === "bajó" && (
                                <>
                                  <ArrowDown
                                    size={16}
                                    className="text-green-500"
                                  />
                                  <span className="text-green-500">Bajó</span>
                                </>
                              )}

                              {feature === "igual" && (
                                <>
                                  <ArrowRight
                                    size={16}
                                    className="text-gray-400"
                                  />
                                  <span className="text-gray-400">Igual</span>
                                </>
                              )}

                              {feature === "nuevo" && (
                                <>
                                  <PlusCircle
                                    size={16}
                                    className="text-blue-500"
                                  />
                                  <span className="text-blue-500">Nuevo</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsBody;
