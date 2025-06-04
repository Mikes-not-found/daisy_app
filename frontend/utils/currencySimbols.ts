const currencySymbols: { [key: string]: string } = {
    USD: '$', // US Dollar
    EUR: '€', // Euro
    GBP: '£', // British Pound
    JPY: '¥', // Japanese Yen
    AUD: 'A$', // Australian Dollar
    CAD: 'C$', // Canadian Dollar
    CHF: 'CHF', // Swiss Franc
    CNY: '¥', // Chinese Yuan
    SEK: 'kr', // Swedish Krona
    NZD: 'NZ$', // New Zealand Dollar
    // Aggiungi altre valute se necessario
  };
  
  export default function getCurrencySymbol(currencyCode: string): string {
    return currencySymbols[currencyCode] || currencyCode;
  }