import { ChartData } from "../HomeBody/HomeBody.types";

export interface ChartByPeriodComponentProps {
  accountSelected: string | null;
  setAccountSelected: (accountName: string | null) => void;
  chartData: ChartData[];
}
