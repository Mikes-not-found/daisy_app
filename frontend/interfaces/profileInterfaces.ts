export interface BankCardDetails {
    id_account: string;
    card_name: string;
    card_balance: number;
    card_currency: string;
}

export interface ListBankCardDetails {
    list_bank_card_details: BankCardDetails[];
}