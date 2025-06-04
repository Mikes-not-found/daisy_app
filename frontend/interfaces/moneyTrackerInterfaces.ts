export enum RowCategory {
    BILLS = "BILLS",
    EARNINGS = "EARNINGS",
    SAVINGS = "SAVINGS",
}

export interface MoneyTrackerItem {
    id?: number,
    category: RowCategory,
    target: string,
    amount: number,
    date: string
}


