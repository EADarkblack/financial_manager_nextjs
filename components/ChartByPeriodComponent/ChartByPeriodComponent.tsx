import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";

//Utils
import { dateFormatter } from "@/utils/functions/dateFormatter";

//Types
import { ChartByPeriodComponentProps } from "./ChartByPeriodComponent.types";

const ChartByPeriodComponent: React.FC<ChartByPeriodComponentProps> = ({
  accountSelected,
  setAccountSelected,
  chartData,
}) => {
  return (
    <div className="bg-[#161B22] p-4 rounded shadow border border-[#1F2937]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">
          {accountSelected ? accountSelected : "Saldo total"} vs Periodos
        </h3>
        {accountSelected && (
          <button
            onClick={() => setAccountSelected(null)}
            className="p-2 rounded-md bg-[#1F2937] hover:bg-[#374151] transition text-[#E5E7EB] flex items-center justify-center cursor-pointer"
            title="Ver total de todas las cuentas"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(date) => dateFormatter(date)}
            stroke="#9CA3AF"
          />
          <YAxis
            stroke="#9CA3AF"
            className="pl-2"
            tickFormatter={(value) => `$${value.toLocaleString("es-CO")}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161B22",
              border: "1px solid #374151",
            }}
            labelStyle={{ color: "#E5E7EB" }}
            formatter={(value: number) => `$${value.toLocaleString("es-CO")}`}
          />
          <Legend />
          {accountSelected ? (
            <>
              <Line
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
              <Legend />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                name="Saldo total"
                dataKey="total"
                stroke="#60A5FA"
                strokeWidth={2}
                dot={false}
              />
              <Legend />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartByPeriodComponent;
