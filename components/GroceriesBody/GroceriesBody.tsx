"use client";
import React, { useEffect, useState } from "react";
import SideBarComponent from "../SideBarComponent/SideBarComponent";

interface Producto {
  referencia: string;
  nombre: string;
  precio: string;
}

interface Factura {
  _id: string;
  fecha: string;
  total: number;
  productos: Producto[];
}

const GroceriesBody = () => {
  // Estados OCR
  const [image, setImage] = useState<File | null>(null);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [items, setItems] = useState<Producto[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ nombre: "", precio: "" });
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">(
    "default"
  );

  // Estados facturas
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [loadingFacturas, setLoadingFacturas] = useState(true);

  const [productosComparacion, setProductosComparacion] = useState<
    {
      referencia: string;
      nombre: string;
      precioActual: number;
      precioAnterior: number | null;
      cambio: string;
    }[]
  >([]);

  // -----------------------
  // Estado de orden para comparación de precios
  // -----------------------
  const [sortOrderComparacion, setSortOrderComparacion] = useState<
    "default" | "asc" | "desc"
  >("default");

  // -----------------------
  // Ordenar productos para la tabla de comparación
  // -----------------------
  const sortedComparacion = [...productosComparacion].sort((a, b) => {
    if (sortOrderComparacion === "default") return 0;
    if (sortOrderComparacion === "asc") return a.precioActual - b.precioActual;
    if (sortOrderComparacion === "desc") return b.precioActual - a.precioActual;
    return 0;
  });

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/product_ocr");
        const data = await res.json();

        console.log(data);

        if (data.success) setProductosComparacion(data.productos);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProductos();
  }, []);

  // -----------------------
  // Cargar facturas desde MongoDB
  // -----------------------
  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch("/api/facturas"); // GET debe retornar { success, facturas }
        const data = await res.json();
        if (data.success) setFacturas(data.facturas);
      } catch (err) {
        console.error("Error cargando facturas:", err);
      } finally {
        setLoadingFacturas(false);
      }
    };
    fetchFacturas();
  }, []);

  // -----------------------
  // Funciones OCR
  // -----------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!image) return alert("Sube una imagen primero");
    setLoadingOCR(true);

    const formData = new FormData();
    formData.append("apikey", "K88373884288957");
    formData.append("language", "spa");
    formData.append("isOverlayRequired", "false");
    formData.append("file", image);
    formData.append("OCREngine", "2");

    try {
      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const rawText = data.ParsedResults?.[0]?.ParsedText || "";

      let cleanText = rawText
        .replace(/[|•·]/g, "")
        .replace(/=/g, "")
        .replace(/\r/g, "")
        .trim();

      const inicioIndex = cleanText.search(/IMPUESTO|DESCRIPCION/i);
      if (inicioIndex !== -1) cleanText = cleanText.substring(inicioIndex);

      const lines = cleanText
        .split("\n")
        .map((l: any) => l.trim())
        .filter(
          (l: any) =>
            l &&
            !l.match(
              /(SUBTOTAL|TOTAL|REFERENCIA|CANT|FACTURA|CAJERO|FECHA|CAMBIO|TARJETA|EFECTIVO|IMPUESTO|DESCRIPCION)/i
            )
        );

      const productos: Producto[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\s+/g, " ").trim();
        const refMatch = line.match(/^[\*\-]?\s*([A-Z0-9]*)\s*-\s*(.+)$/i);

        if (refMatch) {
          const nombre = refMatch[2].trim();
          const referencia =
            refMatch[1].trim() === ""
              ? lines[i - 1].trim()
              : refMatch[1].trim();

          let precio = "";
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (!nextLine || /total|subtotal|cambio|tarjeta/i.test(nextLine))
              continue;

            const priceMatch = nextLine.match(
              /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{0,2})?)\s*(?:[EI1*])$/i
            );
            if (priceMatch) {
              precio = priceMatch[1].replace(".", ",");
              break;
            }
          }

          if (precio && nombre.length > 3) {
            productos.push({ referencia, nombre, precio });
          }
        }
      }

      setItems(productos);
    } catch (err) {
      console.error(err);
      alert("Error al procesar la imagen. Intenta nuevamente.");
    } finally {
      setLoadingOCR(false);
    }
  };

  // -----------------------
  // Funciones edición OCR
  // -----------------------
  const handleDelete = (index: number) => {
    if (!confirm("¿Deseas eliminar este producto?")) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValues({ nombre: items[index].nombre, precio: items[index].precio });
  };

  const cancelEditing = () => setEditingIndex(null);

  const saveEdit = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...editValues };
    setItems(newItems);
    setEditingIndex(null);
  };

  const handleSaveOCR = async () => {
    const facturaItems = items;
    const total = facturaItems.reduce((acc, item) => {
      const num = parseFloat(item.precio.replace(/[^\d]/g, "")) || 0;
      return acc + num;
    }, 0);

    const payload = {
      fecha: new Date().toISOString(),
      total,
      productos: facturaItems,
    };

    try {
      const res = await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        alert("Factura y productos guardados correctamente ✅");
        setFacturas((prev) => [data.factura, ...prev]); // actualizar lista de facturas
        setItems([]);
      } else alert("Error al guardar los datos.");
    } catch (err) {
      console.error(err);
      alert("Error en la conexión con el servidor.");
    }
  };

  const handleResetOCR = () => {
    setImage(null);
    setItems([]);
  };

  const totalProductos = items.length;
  const totalPrecio = items.reduce((acc, item) => {
    const num = parseFloat(item.precio.replace(/[^\d]/g, "")) || 0;
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === "default") return 0;
    const priceA = parseFloat(a.precio.replace(/[^\d]/g, "")) || 0;
    const priceB = parseFloat(b.precio.replace(/[^\d]/g, "")) || 0;
    if (sortOrder === "asc") return priceA - priceB;
    if (sortOrder === "desc") return priceB - priceA;
    return 0;
  });

  return (
    <div className="flex h-screen bg-[#0D1117] text-[#E5E7EB] relative">
      <SideBarComponent />

      <div className="p-4 flex-1 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-[#3B82F6]">
          📸 OCR - Productos y Totales
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="p-2 rounded bg-[#161B22] border border-[#1F2937]"
          />
          <button
            onClick={handleUpload}
            disabled={loadingOCR}
            className="bg-[#3B82F6] text-white px-4 py-2 rounded hover:bg-[#2563EB]"
          >
            {loadingOCR ? "Procesando..." : "Leer factura"}
          </button>
        </div>

        {items.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#161B22] border border-[#1F2937] p-4 rounded mb-3">
              <p>
                <strong>Total de productos:</strong> {totalProductos}
              </p>
              <p>
                <strong>Total a pagar:</strong> $
                {totalPrecio.toLocaleString("es-CO")}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <label className="font-semibold">Ordenar por precio:</label>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "default" | "asc" | "desc")
                }
                className="border rounded p-1 bg-[#161B22] border-[#1F2937] text-[#E5E7EB]"
              >
                <option value="default">Por defecto</option>
                <option value="asc">De menor a mayor</option>
                <option value="desc">De mayor a menor</option>
              </select>
            </div>

            <table className="w-full border-collapse border border-[#1F2937] text-sm">
              <thead className="bg-[#161B22]">
                <tr className="text-center">
                  <th className="border p-2">Referencia</th>
                  <th className="border p-2">Producto</th>
                  <th className="border p-2">Precio</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, i) => (
                  <tr key={i} className="text-center hover:bg-[#1F2937]">
                    <td className="border p-2">{item.referencia}</td>
                    <td className="border p-2">
                      {editingIndex === i ? (
                        <input
                          value={editValues.nombre}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              nombre: e.target.value,
                            })
                          }
                          className="w-full p-1 rounded bg-[#0D1117] border border-[#1F2937]"
                        />
                      ) : (
                        item.nombre
                      )}
                    </td>
                    <td className="border p-2">
                      {editingIndex === i ? (
                        <input
                          value={editValues.precio}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              precio: e.target.value,
                            })
                          }
                          className="w-full p-1 rounded bg-[#0D1117] border border-[#1F2937]"
                        />
                      ) : (
                        `$${item.precio}`
                      )}
                    </td>
                    <td className="border p-2 flex justify-center gap-2">
                      {editingIndex === i ? (
                        <>
                          <button
                            className="bg-green-600 px-2 py-1 rounded hover:bg-green-700"
                            onClick={() => saveEdit(i)}
                          >
                            Guardar
                          </button>
                          <button
                            className="bg-gray-600 px-2 py-1 rounded hover:bg-gray-700"
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
                            onClick={() => startEditing(i)}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                            onClick={() => handleDelete(i)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 flex gap-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSaveOCR}
              >
                Guardar Factura
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={handleResetOCR}
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* Facturas guardadas */}
        <h1 className="text-xl font-bold mt-8 mb-4 text-[#3B82F6]">
          📄 Facturas Guardadas
        </h1>
        {loadingFacturas ? (
          <p>Cargando facturas...</p>
        ) : facturas.length === 0 ? (
          <p>No hay facturas guardadas</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto py-2">
            {facturas.map((factura) => (
              <div
                key={factura._id}
                className="min-w-[250px] bg-[#161B22] p-4 rounded-lg shadow hover:shadow-lg cursor-pointer border border-[#1F2937]"
                onClick={() => setSelectedFactura(factura)}
              >
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(factura.fecha).toLocaleDateString("es-CO")}
                </p>
                <p>
                  <strong>Total:</strong> $
                  {factura.total.toLocaleString("es-CO")}
                </p>
                <p>
                  <strong>Productos:</strong> {factura.productos.length}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalle de factura */}
        {selectedFactura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#0D1117] w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-lg relative max-h-[80vh] overflow-y-auto border border-[#1F2937]">
              <button
                className="absolute top-2 right-2 text-[#E5E7EB] hover:text-white text-xl font-bold"
                onClick={() => setSelectedFactura(null)}
              >
                ✖
              </button>

              <h2 className="text-lg font-bold mb-4 text-[#3B82F6]">
                Factura del{" "}
                {new Date(selectedFactura.fecha).toLocaleDateString("es-CO")}
              </h2>
              <p className="mb-2">
                <strong>Total:</strong> $
                {selectedFactura.total.toLocaleString("es-CO")}
              </p>

              <table className="w-full border-collapse border border-[#1F2937] text-sm">
                <thead className="bg-[#161B22]">
                  <tr className="text-center">
                    <th className="border p-2">Referencia</th>
                    <th className="border p-2">Producto</th>
                    <th className="border p-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFactura.productos.map((p, i) => (
                    <tr key={i} className="text-center hover:bg-[#1F2937]">
                      <td className="border p-2">{p.referencia}</td>
                      <td className="border p-2">{p.nombre}</td>
                      <td className="border p-2">${p.precio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comparación de precios */}
        {productosComparacion.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-[#3B82F6]">
                📊 Comparación de Precios
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <label className="font-semibold">Ordenar por precio:</label>
                <select
                  value={sortOrderComparacion}
                  onChange={(e) =>
                    setSortOrderComparacion(
                      e.target.value as "default" | "asc" | "desc"
                    )
                  }
                  className="border rounded p-1 bg-[#161B22] border-[#1F2937] text-[#E5E7EB]"
                >
                  <option value="default">Por defecto</option>
                  <option value="asc">De menor a mayor</option>
                  <option value="desc">De mayor a menor</option>
                </select>
              </div>
            </div>

            <table className="w-full border-collapse border border-[#1F2937] text-sm">
              <thead className="bg-[#161B22]">
                <tr className="text-center">
                  <th className="border p-2">Referencia</th>
                  <th className="border p-2">Producto</th>
                  <th className="border p-2">Precio Actual</th>
                  <th className="border p-2">Precio Anterior</th>
                  <th className="border p-2">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {sortedComparacion.map((p, i) => {
                  let cambio = "nuevo";
                  if (p.precioAnterior !== null) {
                    if (p.precioActual > p.precioAnterior) cambio = "subió";
                    else if (p.precioActual < p.precioAnterior) cambio = "bajó";
                    else cambio = "igual";
                  }

                  return (
                    <tr key={i} className="text-center hover:bg-[#1F2937]">
                      <td className="border p-2">{p.referencia}</td>
                      <td className="border p-2">{p.nombre}</td>
                      <td className="border p-2">${p.precioActual}</td>
                      <td className="border p-2">
                        {p.precioAnterior !== null
                          ? `$${p.precioAnterior}`
                          : "-"}
                      </td>
                      <td
                        className={`border p-2 font-bold ${
                          cambio === "subió"
                            ? "text-red-600"
                            : cambio === "bajó"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {cambio === "subió"
                          ? "⬆️ subió"
                          : cambio === "bajó"
                          ? "⬇️ bajó"
                          : cambio === "igual"
                          ? "➡️ igual"
                          : "🆕 nuevo"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceriesBody;
