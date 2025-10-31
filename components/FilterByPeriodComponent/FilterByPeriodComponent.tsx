//Types
import { FilterByPeriodComponentProps } from "./FilterByPeriodComponent.types";

const FilterByPeriodComponent: React.FC<FilterByPeriodComponentProps> = ({
  availablePeriods,
  setPeriodSelected,
  periodSelected,
}) => {
  return (
    <div className="mb-4 flex gap-2">
      {availablePeriods.map((item: string) => (
        <button
          key={item}
          onClick={() =>
            setPeriodSelected(item as "Semana" | "Mes" | "Semestre" | "Año")
          }
          className={`px-3 py-1 rounded transition cursor-pointer ${
            periodSelected === item
              ? "bg-[#3B82F6] text-white"
              : "bg-[#1F2937] text-[#9CA3AF] hover:bg-[#2563EB] hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default FilterByPeriodComponent;
