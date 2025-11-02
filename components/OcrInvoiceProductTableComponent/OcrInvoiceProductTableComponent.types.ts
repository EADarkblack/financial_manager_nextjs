import React, { MouseEventHandler } from "react";

//Types
import { Product } from "../InvoicesBody/InvoicesBody.types";

export interface OcrInvoiceProductTableComponentProps {
  items: Product[];
  sortOrder: "default" | "asc" | "desc";
  setSortOrder: React.Dispatch<
    React.SetStateAction<"default" | "asc" | "desc">
  >;
  sortedItems: Product[];
  editingIndex: number | null;
  editValues: Product;
  setEditValues: React.Dispatch<React.SetStateAction<Product>>;
  handleSaveEditProduct: (index: number) => void;
  handleCancelEditProduct: MouseEventHandler<HTMLButtonElement>;
  handleEditProduct: (index: number) => void;
  handleDeleteProduct: (index: number) => void;
  handleSaveInvoice: () => void;
  handleResetOcr: () => void;
  totalOfProducts: number;
  totalPrice: number;
}
