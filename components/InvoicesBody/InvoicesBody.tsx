"use client";

import { useEffect, useState } from "react";
import { SPACE_OCR_API_KEY } from "@/constants/constants";

//Components
import SideBarComponent from "../SideBarComponent/SideBarComponent";
import OcrInvoiceProductTableComponent from "../OcrInvoiceProductTableComponent/OcrInvoiceProductTableComponent";
import InvoiceHistoryTableComponent from "../InvoiceHistoryTableComponent/InvoiceHistoryTableComponent";

//Utils
import {
  getLocalDateString,
  dateFormatter,
} from "../../utils/functions/dateFormatter";

//Types
import { Invoice, Product } from "./InvoicesBody.types";

const InvoicesBody = () => {
  const [image, setImage] = useState<File | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    reference_code: "",
    name: "",
    price: "",
  });
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">(
    "default"
  );
  const [invoice, setInvoice] = useState<Invoice[]>([]);
  const [invoiceSelected, setInvoiceSelected] = useState<Invoice | null>(null);

  const totalOfProducts = items.length;

  const totalPrice = items.reduce((accumulator, item) => {
    const priceParsedToNumber =
      parseFloat(item.price.replace(/[^\d]/g, "")) || 0;

    return accumulator + (isNaN(priceParsedToNumber) ? 0 : priceParsedToNumber);
  }, 0);

  const sortedItems = [...items].sort((firstItem, secondItem) => {
    if (sortOrder === "default") return 0;

    const firstPriceToCompare =
      parseFloat(firstItem.price.replace(/[^\d]/g, "")) || 0;

    const secondPriceToCompare =
      parseFloat(secondItem.price.replace(/[^\d]/g, "")) || 0;

    if (sortOrder === "asc") return firstPriceToCompare - secondPriceToCompare;
    if (sortOrder === "desc") return secondPriceToCompare - firstPriceToCompare;

    return 0;
  });

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const response = await fetch("/api/invoice");

        const result = await response.json();

        switch (result?.message) {
          case "Facturas cargadas exitosamente.":
            setInvoice(result.data);
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
    fetchFacturas();
  }, []);

  const handleLoadOcr = async () => {
    if (!image) return null;

    const formData = new FormData();

    formData.append("apikey", SPACE_OCR_API_KEY);
    formData.append("language", "spa");
    formData.append("isOverlayRequired", "false");
    formData.append("file", image);
    formData.append("OCREngine", "2");

    try {
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result?.OCRExitCode === 1) {
        const rawText = result.ParsedResults?.[0]?.ParsedText || "";

        let cleanText = rawText
          .replace(/[|•·]/g, "")
          .replace(/=/g, "")
          .replace(/\r/g, "")
          .trim();

        const initIndexOnInvoice = cleanText.search(/IMPUESTO|DESCRIPCION/i);

        if (initIndexOnInvoice !== -1)
          cleanText = cleanText.substring(initIndexOnInvoice);

        const lines = cleanText
          .split("\n")
          .map((line: string) => line.trim())
          .filter(
            (line: string) =>
              line &&
              !line.match(
                /(SUBTOTAL|TOTAL|REFERENCIA|CANT|FACTURA|CAJERO|FECHA|CAMBIO|TARJETA|EFECTIVO|IMPUESTO|DESCRIPCION)/i
              )
          );

        const products: Product[] = [];

        for (let index = 0; index < lines.length; index++) {
          const line = lines[index].replace(/\s+/g, " ").trim();

          const referenceCodeMatch = line.match(
            /^[\*\-]?\s*([A-Z0-9]*)\s*-\s*(.+)$/i
          );

          if (referenceCodeMatch) {
            const name = referenceCodeMatch[2].trim();

            const referenceCode =
              referenceCodeMatch[1].trim() === ""
                ? lines[index - 1].trim()
                : referenceCodeMatch[1].trim();

            let price = "";

            for (let j = index + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();

              if (!nextLine || /total|subtotal|cambio|tarjeta/i.test(nextLine))
                continue;

              const priceMatch = nextLine.match(
                /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{0,2})?)\s*(?:[EI1*])$/i
              );

              if (priceMatch) {
                price = priceMatch[1].replace(".", ",");
                break;
              }
            }
            if (price && name.length > 3) {
              products.push({
                reference_code: referenceCode,
                name: name,
                price: price,
              });
            }
          }
        }
        setItems(products);
        setImage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      //TODO: Agregar pantalla de carga
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    setEditValues({
      reference_code: items[index].reference_code,
      name: items[index].name,
      price: items[index].price,
    });
  };

  const handleDeleteProduct = (index: number) => {
    const newItems = [...items];

    newItems.splice(index, 1);

    setItems(newItems);
  };

  const handleSaveEditProduct = (index: number) => {
    const newItems = [...items];

    newItems[index] = { ...newItems[index], ...editValues };

    setItems(newItems);

    setEditingIndex(null);
  };

  const handleCancelEditProduct = () => {
    setEditingIndex(null);
  };

  const handleSaveInvoice = async () => {
    const total = items.reduce((accumulator, item) => {
      const priceParsedToNumber =
        parseFloat(item.price.replace(/[^\d]/g, "")) || 0;

      return accumulator + priceParsedToNumber;
    }, 0);

    const body = {
      date: dateFormatter(getLocalDateString()),
      total_price: total,
      products: items,
    };

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      switch (result?.message) {
        case "Factura guardada exitosamente.":
          setInvoice((prev) => [result.data, ...prev]);
          setItems([]);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetOcr = () => {
    setItems([]);
  };

  return (
    <div className="flex h-full bg-[#0D1117] text-[#E5E7EB] relative">
      <SideBarComponent />

      <div className="flex flex w-full h-[100vh] justify-center">
        <div className="flex flex-col w-[1004px] justify-start mt-6">
          <h1 className="text-3xl font-semibold mb-4 text-[#3B82F6]">
            Facturas
          </h1>

          <div className="flex gap-2 mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="p-2 rounded bg-[#161B22] border border-[#1F2937]"
            />
            <button
              onClick={handleLoadOcr}
              className="bg-[#3B82F6] text-white px-4 py-2 rounded hover:bg-[#2563EB] cursor-pointer"
            >
              Cargar factura
            </button>
          </div>

          <hr />

          <OcrInvoiceProductTableComponent
            items={items}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            sortedItems={sortedItems}
            editingIndex={editingIndex}
            editValues={editValues}
            setEditValues={setEditValues}
            handleSaveEditProduct={handleSaveEditProduct}
            handleCancelEditProduct={handleCancelEditProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleSaveInvoice={handleSaveInvoice}
            handleResetOcr={handleResetOcr}
            totalOfProducts={totalOfProducts}
            totalPrice={totalPrice}
          />

          <InvoiceHistoryTableComponent
            invoice={invoice}
            setInvoiceSelected={setInvoiceSelected}
            invoiceSelected={invoiceSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicesBody;
