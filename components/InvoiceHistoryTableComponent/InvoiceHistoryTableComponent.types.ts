//Types
import { Invoice } from "../InvoicesBody/InvoicesBody.types";

export interface InvoiceHistoryTableComponentProps {
  invoice: Invoice[];
  setInvoiceSelected: Function;
  invoiceSelected: Invoice | null;
}
