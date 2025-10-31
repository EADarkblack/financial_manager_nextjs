"use client";

import { useState } from "react";
import { AccountCardComponentProps } from "./AccountCardComponent.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, MoreVertical, X } from "lucide-react";

//Types
import { Account } from "../HomeBody/HomeBody.types";

const AccountCardComponent: React.FC<AccountCardComponentProps> = ({
  accountList,
  setAccountSelected,
  handleChangeEditAccountCard,
  handleSaveEditAccountCard,
  handleCancelEditAccountCard,
  handleEditAccountCard,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {accountList.map((account: Account, index: number) => (
        <div
          key={account._id || index}
          className="bg-[#161B22] border border-[#1F2937] shadow-lg rounded-lg p-6 hover:border-[#3B82F6] transition cursor-pointer relative"
          onClick={() => setAccountSelected(account.name)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-[#E5E7EB]">{account.name}</h3>
            {!account.editing && (
              <DropdownMenu
                open={openMenuIndex === index}
                onOpenChange={(open) => setOpenMenuIndex(open ? index : null)}
              >
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#9CA3AF] hover:text-white transition cursor-pointer outline-none"
                >
                  <MoreVertical size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-[#1F2937] text-white border border-[#374151]"
                  align="end"
                >
                  <DropdownMenuItem
                    className="hover:bg-[#374151] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAccountCard(index);
                      setOpenMenuIndex(null);
                    }}
                  >
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {account.editing ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={account.balance.toLocaleString("es-CO")}
                onChange={(e) =>
                  handleChangeEditAccountCard(index, e.target.value)
                }
                className="bg-[#0D1117] border border-[#374151] p-1 flex-1 rounded text-[#E5E7EB]"
              />

              <button
                className="bg-[#10B981] text-white p-2 rounded hover:bg-[#059669] flex items-center justify-center cursor-pointer"
                title="Guardar"
                onClick={() =>
                  handleSaveEditAccountCard(index, account.balance)
                }
              >
                <Check size={18} />
              </button>

              <button
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center justify-center cursor-pointer"
                title="Cancelar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEditAccountCard(index);
                }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <p className="text-[#9CA3AF]">
              Saldo actual:{" "}
              <span className="text-[#E5E7EB] font-semibold">
                ${account.balance.toLocaleString("es-CO")}
              </span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccountCardComponent;
