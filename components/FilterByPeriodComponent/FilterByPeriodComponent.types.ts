import { Dispatch, SetStateAction } from "react";

export interface FilterByPeriodComponentProps {
  availablePeriods: string[];
  setPeriodSelected: Dispatch<
    SetStateAction<"Semana" | "Mes" | "Semestre" | "Año">
  >;
  periodSelected: string;
}
