import { ParamListBase } from "@react-navigation/native";

export interface BankSelectorProps {
    banks: BankList[];
    setFlagBankSelector: (flag: boolean) => void;
    saveBankDetails: (bankdata: BankInstitutionRequisition) => void;
  }

export interface BankInstitutionRequisition {
  institutionId: string,
  requisitionId: string
}

export interface BankList {
    id: string,
    name: string,
    bic: string,
    transaction_total_days: number,
    countries: string[],
    logo: string,
    max_access_valid_for_days: number
 }


 // Definisci i parametri di navigazione
export interface BankNavigationParams extends ParamListBase {
    BankSelector: {
        banks: any[];
    };
    ErrorScreen: { error: { message: string; details?: string } };
    SuccessScreen: { message: string };
    Profile: undefined;
  }