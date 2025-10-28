"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

//Components
import SideBarComponent from "../SideBarComponent/SideBarComponent";

interface Historial {
  fecha: string;
  saldo: number;
}

interface Cuenta {
  _id?: string;
  nombre: string;
  saldo: number;
  editing?: boolean;
  historial: Historial[];
}

const periodosDisponibles = ["Semana", "Mes", "Semestre", "Año"];

const HomeBody = () => {
  const [selectedCuenta, setSelectedCuenta] = useState<string | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Semana");
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [transacciones, setTransacciones] = useState([]);

  // 🟢 Cargar las cuentas desde MongoDB
  const fetchCuentas = async () => {
    try {
      const res = await fetch("/api/cuenta");
      const data = await res.json();
      const cuentasConEstado = data.map((c: Cuenta) => ({
        ...c,
        editing: false,
      }));
      setCuentas(cuentasConEstado);
    } catch (error) {
      console.error("Error cargando cuentas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch("/api/historial_transaccion");
      const data = await res.json();
      if (data.ok) setTransacciones(data.transacciones);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  useEffect(() => {
    fetchCuentas();
    fetchHistorial();
  }, []);

  const startEditing = (index: number) => {
    const nuevas = [...cuentas];
    nuevas[index].editing = true;
    setCuentas(nuevas);
  };

  const cancelEditing = (index: number) => {
    const nuevas = [...cuentas];
    nuevas[index].editing = false;
    setCuentas(nuevas);
  };

  const saveEditing = async (index: number, nuevoSaldo: number) => {
    const nuevas = [...cuentas];
    nuevas[index].saldo = nuevoSaldo;
    nuevas[index].editing = false;
    setCuentas(nuevas);

    const cuenta = nuevas[index];
    try {
      const res = await fetch("/api/cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: cuenta.nombre, saldo: cuenta.saldo }),
      });

      if (res.ok) {
        console.log(`💾 ${cuenta.nombre} guardada en MongoDB`);
        fetchCuentas();
      } else {
        console.error("Error al guardar cuenta");
      }
    } catch (err) {
      console.error("Error al enviar datos:", err);
    }
  };

  const handleSaldoChange = (index: number, value: string) => {
    const nuevas = [...cuentas];
    nuevas[index].saldo = parseInt(value.replace(/\D/g, "")) || 0;
    setCuentas(nuevas);
  };

  // 🔹 Filtrar datos para la gráfica
  const getChartDataPorPeriodo = (cuenta: Cuenta) => {
    const hoy = new Date();
    let dias = 7;

    switch (periodoSeleccionado) {
      case "Mes":
        dias = 30;
        break;
      case "Semestre":
        dias = 180;
        break;
      case "Año":
        dias = 365;
        break;
    }

    const historialFiltrado = cuenta.historial
      .filter((h) => {
        const fecha = new Date(h.fecha);
        return (
          (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24) <= dias
        );
      })
      .sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );

    const data: { periodo: string; saldo: number }[] = [];
    let ultimoSaldo: number | null = null;

    historialFiltrado.forEach((h) => {
      if (ultimoSaldo === null || h.saldo !== ultimoSaldo) {
        data.push({ periodo: h.fecha, saldo: h.saldo });
        ultimoSaldo = h.saldo;
      }
    });

    return data;
  };

  // 🔹 Generar datos para la gráfica principal
  let chartData: any[] = [];
  if (selectedCuenta) {
    const cuenta = cuentas.find((c) => c.nombre === selectedCuenta);
    if (cuenta) chartData = getChartDataPorPeriodo(cuenta);
  } else {
    const fechas = Array.from(
      new Set(
        cuentas.flatMap((c) => getChartDataPorPeriodo(c).map((d) => d.periodo))
      )
    ).sort();

    chartData = fechas.map((fecha) => {
      const total = cuentas.reduce((acc, c) => {
        const h = c.historial.find((h) => h.fecha === fecha);
        return acc + (h?.saldo || 0);
      }, 0);
      return { periodo: fecha, Total: total };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Cargando cuentas...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0D1117] text-[#E5E7EB] relative">
      <SideBarComponent />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <main className="flex-1 p-4 mt-10 md:mt-0">
          <h2 className="text-2xl font-semibold mb-4 text-[#3B82F6]">
            Cuentas
          </h2>

          {/* Selector de periodo */}
          <div className="mb-4 flex gap-2">
            {periodosDisponibles.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodoSeleccionado(p)}
                className={`px-3 py-1 rounded transition ${
                  periodoSeleccionado === p
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#1F2937] text-[#9CA3AF] hover:bg-[#2563EB] hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {cuentas.map((cuenta, i) => (
              <div
                key={cuenta._id || i}
                className="bg-[#161B22] border border-[#1F2937] shadow-lg rounded-lg p-6 hover:border-[#3B82F6] transition cursor-pointer"
                onClick={() => setSelectedCuenta(cuenta.nombre)}
              >
                <h3 className="text-xl font-bold mb-2 text-[#E5E7EB]">
                  {cuenta.nombre}
                </h3>

                {cuenta.editing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={cuenta.saldo.toLocaleString("es-CO")}
                      onChange={(e) => handleSaldoChange(i, e.target.value)}
                      className="bg-[#0D1117] border border-[#374151] p-1 flex-1 rounded text-[#E5E7EB]"
                    />
                    <button
                      className="bg-[#10B981] text-white px-3 py-1 rounded hover:bg-[#059669]"
                      onClick={() => saveEditing(i, cuenta.saldo)}
                    >
                      Guardar
                    </button>
                    <button
                      className="bg-[#374151] text-white px-3 py-1 rounded hover:bg-[#4B5563]"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditing(i);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-[#9CA3AF]">
                      Saldo actual:{" "}
                      <span className="text-[#E5E7EB] font-semibold">
                        ${cuenta.saldo.toLocaleString("es-CO")}
                      </span>
                    </p>
                    <button
                      className="bg-[#3B82F6] text-white px-2 py-1 rounded hover:bg-[#2563EB]"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(i);
                      }}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gráfica */}
          <div className="bg-[#161B22] p-4 rounded shadow border border-[#1F2937]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">
                {selectedCuenta ? selectedCuenta : "Saldo total"} vs Periodos
              </h3>
              {selectedCuenta && (
                <button
                  onClick={() => setSelectedCuenta(null)}
                  className="bg-[#3B82F6] text-white px-3 py-1 rounded hover:bg-[#2563EB] transition"
                >
                  Ver total de todas las cuentas
                </button>
              )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="periodo" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161B22",
                    border: "1px solid #374151",
                  }}
                  labelStyle={{ color: "#E5E7EB" }}
                  formatter={(value: number) =>
                    `$${value.toLocaleString("es-CO")}`
                  }
                />
                <Legend />
                {selectedCuenta ? (
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="Total"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Historial de Transacciones */}
          <div className="bg-[#161B22] p-4 rounded shadow border border-[#1F2937] mt-6">
            <h3 className="text-xl font-bold mb-4 text-[#E5E7EB]">
              Historial de Transacciones
            </h3>

            {transacciones.length === 0 ? (
              <p className="text-[#9CA3AF]">
                No hay transacciones registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-[#1F2937] text-sm">
                  <thead>
                    <tr className="bg-[#1F2937] text-[#E5E7EB]">
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Remitente / Origen</th>
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((t) => (
                      <tr
                        key={t._id}
                        className="border-t border-[#374151] hover:bg-[#1F2937] transition-colors"
                      >
                        <td className="p-2">
                          {new Date(t.fecha).toLocaleString("es-CO")}
                        </td>
                        <td className="p-2">{t.origen}</td>
                        <td className="p-2">{t.descripcion}</td>
                        <td
                          className={`p-2 text-right font-semibold ${
                            t.tipo === "transfer_in"
                              ? "text-[#10B981]"
                              : "text-red-500"
                          }`}
                        >
                          {t.tipo === "transfer_in" ? "+" : "-"}$
                          {t.valor.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeBody;
