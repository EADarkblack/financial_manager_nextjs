import { Account } from "../HomeBody/HomeBody.types";

export interface AccountCardComponentProps {
  accountList: Account[];
  setAccountSelected: (accountName: string) => void;
  handleChangeEditAccountCard: (index: number, value: string) => void;
  handleSaveEditAccountCard: (index: number, newBalance: number) => void;
  handleCancelEditAccountCard: (index: number) => void;
  handleEditAccountCard: (index: number) => void;
}
