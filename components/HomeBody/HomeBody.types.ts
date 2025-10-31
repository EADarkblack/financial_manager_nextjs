export interface Account {
  _id: string;
  name: string;
  balance: number;
  editing?: boolean;
  transaction_history: {
    date: string;
    balance: number;
  }[];
}

export interface TransactionHistory {
  _id: string;
  date: string;
  value: number;
  receiver: string;
  type: string;
  description: string;
}

export interface ChartData {
  date: string;
  balance: number;
  total?: number;
}
