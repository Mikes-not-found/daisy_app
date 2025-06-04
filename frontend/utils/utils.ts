const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export const convertDateString = (dateString: string) => {

    const [year, month, day] = dateString.split('-');
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  }


export const formatDateToISO = (date: Date) => {
    return date.toISOString().split('T')[0]; // Ottiene solo la parte di data
  };

  
export const getCurrentMonth = () => {
    return months[new Date().getMonth()];
  }

export function formatDateString(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }


export function getFormattedDateYYYYMMDD(inputDateString: Date) {
    const date = new Date(inputDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate() ? String(date.getDate()).padStart(2, '0') : '01';
    return `${year}-${month}-${day}`;
}

export function isFieldValid(value: any): boolean {
    if (value == null) {
      return false;
    }
  
    if (value instanceof Date) {
      console.log("Validazione data:", value);
      return true;
    }
  
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
  
    if (Array.isArray(value)) {
      return value.length > 0;
    }
  
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).length > 0;
    }
  
    if (typeof value === 'number') {
      return value > 0; 
    }
  
    return true;
  }

  export function getCurrentMonthName() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[new Date().getMonth()];
  }

  
  