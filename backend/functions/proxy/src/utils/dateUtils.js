export class DateUtils {
  static getCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    return `${date} ${time}`;
  }

  static formatDateString(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  }

  static getDateRange(days = 30) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }

  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
} 