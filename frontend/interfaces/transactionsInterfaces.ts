export interface TransactionsData {
    booked: Transaction[];
    pending: Transaction[];
  }
  
export interface TransactionAmount {
    amount: string;
    currency: string;
  }
  
export interface Transaction {
    bookingDate: string,
    valueDate: string,
    transactionAmount: TransactionAmount,
    debtorName: string
    remittanceInformationUnstructured: string,
    category: string
  }
  
  
export interface TransactionDatesInterval {
    start_date?: string ,
    end_date?: string
  }


export type dateTransaction = {
    date: string;
    amount: number;
  };