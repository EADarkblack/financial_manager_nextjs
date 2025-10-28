"use client";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa6";
import { usePathname } from "next/navigation"; // 👈 Importa esto

const SideBarComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname(); // 👈 Obtiene la ruta actual de forma segura

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeSidebarOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 bg-[#3B82F6] text-white p-2 rounded md:hidden hover:bg-[#2563EB] transition"
      >
        <FaBars size={20} />
      </button>

      <aside
        className={`bg-[#161B22] text-[#E5E7EB] w-64 space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out shadow-lg`}
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-[#3B82F6]">
          Gestor de Gastos
        </h2>

        <nav className="flex flex-col gap-2 px-4">
          <a
            href="/"
            onClick={closeSidebarOnMobile}
            className={`flex items-center gap-2 p-2 rounded transition ${
              pathname === "/"
                ? "bg-[#1F2937] text-[#3B82F6]"
                : "hover:bg-[#1F2937] hover:text-[#3B82F6]"
            }`}
          >
            <span>Inicio</span>
          </a>

          <a
            href="/groceries"
            onClick={closeSidebarOnMobile}
            className={`flex items-center gap-2 p-2 rounded transition ${
              pathname === "/groceries"
                ? "bg-[#1F2937] text-[#3B82F6]"
                : "hover:bg-[#1F2937] hover:text-[#3B82F6]"
            }`}
          >
            <span>Mercado</span>
          </a>
        </nav>
      </aside>
    </>
  );
};

export default SideBarComponent;
