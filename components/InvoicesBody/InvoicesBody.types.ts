export interface Product {
  reference_code: string;
  name: string;
  price: string;
}

export interface Invoice {
  _id: string;
  date: string;
  total_price: number;
  product: Product[];
}
